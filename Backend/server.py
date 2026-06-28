from fastapi import FastAPI # type: ignore
import requests
from sklearn.neighbors import NearestNeighbors
import numpy as np

app = FastAPI()

# Added CORS Middleware
from fastapi.middleware.cors import CORSMiddleware  # type: ignore

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper function to get the weakest tag
def get_weakest_tag(clean_data):
    solved_problems = set() # Set of Solved Problems
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
        return [], solved_problems
    
    sorted_tags = sorted(fail_tag_count.items(), key=lambda x: x[1], reverse=True)
    weakest_tag = [tag for tag, count in sorted_tags[:3]]
    return weakest_tag, solved_problems

    
    

# Helper function to get the target rating from the Users Rating
def get_target_rating(handle:str):
    url = f"https://codeforces.com/api/user.info?handles={handle}"
    response = requests.get(url)

    if response.status_code==200:
        data = response.json()
        user_data = data["result"][0]
        rating = user_data["rating"]
        if rating is None or rating<700:
            return 800
        return rating + 100
    else:
        return 800
    
# Helper Function to get the Reccomended Problems
def get_reccomendation(weakest_tag, target_rating, solved_problems):
    # Fetch global database
    url = "https://codeforces.com/api/problemset.problems"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        problems = data["result"]["problems"]
        valid_problems = []
        feature_vectors = []
        for prob in problems:
            name = prob["name"]
            rating = prob.get("rating", "Unrated")
            if name in solved_problems or rating == "Unrated":
                continue
            tag_match_score = 0
            for tag in prob["tags"]:
                if tag in weakest_tag:
                    tag_match_score += 300
            valid_problems.append(prob)
            feature_vectors.append([rating, tag_match_score])

        k_value = 5
        k_value = min(len(valid_problems), k_value)
        knn = NearestNeighbors(n_neighbors=k_value, metric="euclidean")
        knn.fit(feature_vectors)

        perfect_tag_score = len(weakest_tag)*300
        distances, indices = knn.kneighbors([[target_rating, perfect_tag_score]])
        reccomendation = []
        
        for idx in indices[0]:
            problem = valid_problems[idx]
            reccomendation.append({
                "name": problem["name"],
                "rating": problem.get("rating", "Unrated"),
                "tags": problem["tags"],
                "link": f"https://codeforces.com/contest/{problem['contestId']}/problem/{problem['index']}"
            })
        return reccomendation

    else:
        return {"error": "Failed to fetch problems"}
    


# The API Gateway
@app.get("/analyze/{handle}")
def analyze(handle: str):
    url = f"https://codeforces.com/api/user.status?handle={handle}&from=1&count=100"
    response = requests.get(url)

    if response.status_code ==200:
        data = response.json()
        submissions = data.get("result", [])
        
        # If there isn't enough data just reccomending a default problem
        if len(submissions)<15:
            return {
                "handle":handle,
                "diagnosis": "Not enough data! The Algo-Coach needs at least 15 submissions.",
                "action_plan": {
                    "message": "Start with the fundamentals.",
                    "recommended_problem": "Watermelon", 
                    "link": "https://codeforces.com/problemset/problem/4/A"
                }
            }
        
        # Clean the Data
        clean_data = []
        for submission in submissions:
            problem = submission["problem"]
            rating = problem.get("rating", "Unrated")
            clean_data.append({
                "name" : problem["name"],
                "rating" : rating,
                "tags" : problem["tags"],
                "verdict": submission["verdict"]
            })
        
        # Extracting the Weakest Tag and Solved Problems
        weakest_tag, solved_problems = get_weakest_tag(clean_data)

        # If no Wrong Submissions
        if not weakest_tag:
            return{
                "handle" : handle,
                "diagnosis": "No Wrong Submissions! in the last 100 submissions",
                "action_plan":"Continue doing what you are doing."
            }
        
        target_rating = get_target_rating(handle)
        recommended_problem = get_reccomendation(weakest_tag, target_rating, solved_problems)
        
        return{
            "handle" : handle,
            "Target Rating": target_rating,
            "Weakest Tag": ",".join(weakest_tag),
            "Recommended Problem": recommended_problem
        }

    else:
        return {"Message":"Error fetching data from Codeforces", "status":response.status_code}