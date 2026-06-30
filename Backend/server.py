from fastapi import FastAPI # type: ignore
import httpx  # type: ignore
from sklearn.neighbors import NearestNeighbors
import numpy as np
import json
import time
import os
import asyncio

CACHE_FILE = "problems_cache.json"
CACHE_TTL = 86400

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware # type: ignore

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://algo-coach-navy.vercel.app",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory lock so concurrent requests don't all refresh the cache at once
_cache_lock = asyncio.Lock()


#  Problem caching (fixed + async) 
async def get_problems():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r") as f:
            cache = json.load(f)
        age = time.time() - cache["timestamp"]
        if age < CACHE_TTL:
            return cache["problems"]

    # Lock so only one concurrent request actually refreshes the cache
    async with _cache_lock:
        # Re-check after acquiring lock — another request may have just refreshed it
        if os.path.exists(CACHE_FILE):
            with open(CACHE_FILE, "r") as f:
                cache = json.load(f)
            age = time.time() - cache["timestamp"]
            if age < CACHE_TTL:
                return cache["problems"]

        async with httpx.AsyncClient() as client:
            response = await client.get("https://codeforces.com/api/problemset.problems")
        data = response.json()
        problems = data["result"]["problems"]

        with open(CACHE_FILE, "w") as f:
            json.dump({"timestamp": time.time(), "problems": problems}, f)

        return problems


#  Weakness breakdown 
def get_weakest_tag(clean_data):
    """
    Returns (weakest_tags, solved_problems, full_breakdown)
    full_breakdown = sorted list of {tag, fail_count} for ALL failed tags,
    not just top 3 — used for the weakness breakdown feature.
    """
    solved_problems = set()
    failed_problems = []
    for submission in clean_data:
        if submission["verdict"] == "OK":
            solved_problems.add(submission["name"])
        else:
            failed_problems.append(submission)

    fail_tag_count = {}
    for submission in failed_problems:
        if submission["name"] not in solved_problems:
            for tag in submission["tags"]:
                fail_tag_count[tag] = fail_tag_count.get(tag, 0) + 1

    if not fail_tag_count:
        return [], solved_problems, []

    sorted_tags = sorted(fail_tag_count.items(), key=lambda x: x[1], reverse=True)
    weakest_tag = [tag for tag, count in sorted_tags[:3]]

    # Full breakdown with percentage of total failures
    total_fails = sum(fail_tag_count.values())
    full_breakdown = [
        {
            "tag": tag,
            "fail_count": count,
            "percentage": round((count / total_fails) * 100, 1)
        }
        for tag, count in sorted_tags[:8]
    ]

    return weakest_tag, solved_problems, full_breakdown


#  Target rating 
async def get_target_rating(handle: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://codeforces.com/api/user.info?handles={handle}")

    if response.status_code == 200:
        data = response.json()
        user_data = data["result"][0]
        rating = user_data["rating"]
        if rating is None or rating < 700:
            return 800
        return rating + 100
    else:
        return 800


#  Core KNN matcher — now takes an explicit target_rating + returns explainability 
def knn_match(problems, weakest_tag, target_rating, solved_problems, k=5, rating_window=300):
    RATING_WEIGHT = 0.25
    TAG_WEIGHT = 0.75

    valid_problems = []
    raw_ratings = []
    raw_tag_scores = []

    for prob in problems:
        name = prob["name"]
        rating = prob.get("rating", "Unrated")

        if name in solved_problems or rating == "Unrated":
            continue
        if abs(rating - target_rating) > rating_window:
            continue

        if weakest_tag:
            matched_tags = [tag for tag in prob["tags"] if tag in weakest_tag]
            tag_score = len(matched_tags) / len(weakest_tag)
        else:
            matched_tags = []
            tag_score = 0.0

        valid_problems.append((prob, matched_tags))
        raw_ratings.append(rating)
        raw_tag_scores.append(tag_score)

    if not valid_problems:
        return []

    min_r = min(raw_ratings)
    max_r = max(raw_ratings)
    rating_range = (max_r - min_r) if max_r != min_r else 1

    feature_vectors = []
    for r, t in zip(raw_ratings, raw_tag_scores):
        norm_rating = ((r - min_r) / rating_range) * RATING_WEIGHT
        norm_tags = t * TAG_WEIGHT
        feature_vectors.append([norm_rating, norm_tags])

    norm_target_rating = ((target_rating - min_r) / rating_range) * RATING_WEIGHT
    norm_target_tags = 1.0 * TAG_WEIGHT

    k_value = min(len(valid_problems), k)
    knn = NearestNeighbors(n_neighbors=k_value, metric="euclidean")
    knn.fit(feature_vectors)

    distances, indices = knn.kneighbors([[norm_target_rating, norm_target_tags]])

    recommendations = []
    for dist, idx in zip(distances[0], indices[0]):
        problem, matched_tags = valid_problems[idx]
        recommendations.append({
            "name": problem["name"],
            "rating": problem.get("rating", "Unrated"),
            "tags": problem["tags"],
            "link": f"https://codeforces.com/contest/{problem['contestId']}/problem/{problem['index']}",
            #  Explainability (NEW) 
            "match_reason": {
                "matched_tags": matched_tags,
                "tag_match_ratio": f"{len(matched_tags)}/{len(weakest_tag)}" if weakest_tag else "0/0",
                "rating_diff": problem.get("rating", 0) - target_rating,
                "distance_score": round(float(dist), 4)
            }
        })
    return recommendations


#  Staircase recommendation 
def get_staircase_recommendation(weakest_tag, target_rating, solved_problems, problems):
    """
    Returns problems at 3 difficulty tiers instead of all at target_rating:
      - confidence: 2 problems below target (builds momentum)
      - target:     1-2 problems at target (the core challenge)
      - stretch:    1-2 problems above target (growth edge)
    """
    confidence_rating = max(800, target_rating - 200)
    stretch_rating = target_rating + 200

    confidence_problems = knn_match(
        problems, weakest_tag, confidence_rating, solved_problems, k=2, rating_window=150
    )
    target_problems = knn_match(
        problems, weakest_tag, target_rating, solved_problems, k=2, rating_window=150
    )
    stretch_problems = knn_match(
        problems, weakest_tag, stretch_rating, solved_problems, k=1, rating_window=200
    )

    # Dedupe across tiers in case of overlap
    seen_names = set()
    def dedupe(probs):
        result = []
        for p in probs:
            if p["name"] not in seen_names:
                seen_names.add(p["name"])
                result.append(p)
        return result

    return {
        "confidence": dedupe(confidence_problems),
        "target": dedupe(target_problems),
        "stretch": dedupe(stretch_problems),
    }


#  API Gateway  
@app.get("/analyze/{handle}")
async def analyze(handle: str, mode: str = "standard"):
    """
    mode=standard   → original flat top-5 recommendation (default, backward compatible)
    mode=staircase  → confidence/target/stretch tiered recommendation
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://codeforces.com/api/user.status?handle={handle}&from=1&count=100"
        )

    if response.status_code != 200:
        return {
            "error": "invalid_handle",
            "message": f"'{handle}' is not a valid Codeforces handle. Check for typos."
        }

    data = response.json()

    if data.get("status") == "FAILED":
        return {
            "error": "invalid_handle",
            "message": f"'{handle}' is not a valid Codeforces handle. Check for typos."
        }

    submissions = data.get("result", [])

    if len(submissions) < 15:
        return {
            "handle": handle,
            "diagnosis": "Not enough data! The Algo-Coach needs at least 15 submissions.",
            "action_plan": {
                "message": "Start with the fundamentals.",
                "recommended_problem": "Watermelon",
                "link": "https://codeforces.com/problemset/problem/4/A"
            }
        }

    clean_data = []
    for submission in submissions:
        problem = submission["problem"]
        rating = problem.get("rating", "Unrated")
        clean_data.append({
            "name": problem["name"],
            "rating": rating,
            "tags": problem["tags"],
            "verdict": submission["verdict"]
        })

    weakest_tag, solved_problems, weakness_breakdown = get_weakest_tag(clean_data)

    if not weakest_tag:
        return {
            "handle": handle,
            "diagnosis": "No Wrong Submissions! in the last 100 submissions",
            "action_plan": "Continue doing what you are doing."
        }

    # Run target rating fetch and problem cache fetch concurrently — this is
    # the real concurrency win, not just "async syntax for its own sake"
    target_rating, problems = await asyncio.gather(
        get_target_rating(handle),
        get_problems()
    )

    if mode == "staircase":
        staircase = get_staircase_recommendation(weakest_tag, target_rating, solved_problems, problems)
        return {
            "handle": handle,
            "Target Rating": target_rating,
            "Weakest Tag": ",".join(weakest_tag),
            "Weakness Breakdown": weakness_breakdown,
            "Staircase": staircase
        }

    # Standard mode (backward compatible with current frontend)
    recommended_problem = knn_match(problems, weakest_tag, target_rating, solved_problems, k=5)

    return {
        "handle": handle,
        "Target Rating": target_rating,
        "Weakest Tag": ",".join(weakest_tag),
        "Weakness Breakdown": weakness_breakdown,
        "Recommended Problem": recommended_problem
    }