# AlgoCoach

```bash
$ ./algo_coach --init
```

A machine-learning-powered weakness detector and problem recommender for competitive programmers on Codeforces.

AlgoCoach analyzes your recent Codeforces submissions, identifies the algorithmic concepts you struggle with the most, and uses K-Nearest Neighbors (KNN) to recommend problems precisely matched to your weaknesses and rating target.

**Live Demo:** [AlgoCoach on Vercel](https://algo-coach-navy.vercel.app/)

---

## What's New in v2

| Feature | v1 | v2 |
|---|---|---|
| Weakness display | Top 3 tags shown as badges | Full breakdown with failure counts and percentage bars |
| Problem cards | Name, rating, tags | + matched weak tags highlighted (✓) + why this problem was picked |
| Recommendation mode | Flat top-5 only | **TOP 5** or **STAIRCASE** (confidence → target → stretch) |
| Concurrency | Blocking sync requests | Async (`httpx` + `asyncio.gather`) — multiple users served simultaneously |
| Problem database | Fetched fresh on every request | Cached to disk, refreshed every 24 hours |
| Invalid handle | Generic error | Specific `INVALID HANDLE` message with instructions |
| Server cold start | Generic error | `SERVER WAKING UP` message with wait instructions |

---

## How It Works

AlgoCoach doesn't give you random problems. It builds a mathematical profile of your weaknesses:

**1. Data Fetching**
Pulls your last 100 submissions via the Codeforces API. Separates solved problems (ever reached verdict OK) from persistent failures (failed and never solved).

**2. Weakness Diagnosis**
Counts tag failures across all persistently-failed problems. Returns your top 3 weakest tags plus a full ranked breakdown with failure percentages across up to 8 tags.

**3. Problem Database (cached)**
Fetches the entire Codeforces problem database once and caches it to disk for 24 hours. Subsequent requests read from cache — no redundant API calls.

**4. Feature Vectorization**
For every unsolved problem within ±300 rating of your target:
- **Tag score (75% weight):** fraction of your 3 weak tags this problem covers → normalized to [0, 1]
- **Rating score (25% weight):** position within the ±300 rating window → normalized to [0, 1]

Tags weighted 3× more than rating because in CP, being weak at a specific topic matters more than difficulty level.

**5. KNN Recommendation**
Uses scikit-learn's K-Nearest Neighbors (Euclidean distance) to find problems closest to the ideal point `[target_rating, perfect_tag_match]`. Returns the top matches with explainability metadata — which weak tags each problem covers and how far its rating is from your target.

**6. Two Recommendation Modes**

- **TOP 5** — 5 problems closest to your exact target, sorted by KNN distance
- **STAIRCASE** — 3 tiers, each running a separate KNN query:
  - `CONFIDENCE` (target − 200): 2 problems to build momentum
  - `TARGET` (your target): 2 core challenge problems
  - `STRETCH` (target + 200): 1 growth-edge problem

---

## Tech Stack

| Layer | Tool | Role |
|---|---|---|
| Frontend hosting | Vercel | Auto-deploy on push |
| UI | React + Vite | Component rendering, mode toggle, 6 response states |
| Backend hosting | Render | Free tier, Python runtime |
| API | FastAPI (async) | Endpoint routing, async request handling |
| HTTP client | httpx | Async CF API calls (replaces blocking `requests`) |
| ML | scikit-learn KNN | Euclidean distance neighbor search |
| Data | NumPy | Feature vector normalization |
| Server | Uvicorn (ASGI) | Async web server |
| Cache | Local JSON file | 24-hour problem database cache |

**Total infrastructure cost: $0**

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/ritamghosh1/Algo_Coach.git
cd Algo_Coach
```

### 2. Backend Setup

```bash
cd Backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

Backend runs at `http://localhost:8000`
Auto-docs (Swagger UI) at `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd Frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## API Reference

### `GET /analyze/{handle}`

Query parameters:
- `mode=standard` (default) — returns flat top-5 recommendation
- `mode=staircase` — returns confidence / target / stretch tiers

**Success (standard mode):**
```json
{
  "handle": "tourist",
  "Target Rating": 3622,
  "Weakest Tag": "flows,strings,dp",
  "Weakness Breakdown": [
    { "tag": "flows", "fail_count": 8, "percentage": 40.0 },
    { "tag": "strings", "fail_count": 6, "percentage": 30.0 },
    { "tag": "dp", "fail_count": 4, "percentage": 20.0 }
  ],
  "Recommended Problem": [
    {
      "name": "Problem Name",
      "rating": 3500,
      "tags": ["flows", "graphs"],
      "link": "https://codeforces.com/contest/123/problem/A",
      "match_reason": {
        "matched_tags": ["flows"],
        "tag_match_ratio": "1/3",
        "rating_diff": -122,
        "distance_score": 0.1823
      }
    }
  ]
}
```

**Success (staircase mode):**
```json
{
  "handle": "tourist",
  "Target Rating": 3622,
  "Weakest Tag": "flows,strings,dp",
  "Weakness Breakdown": [...],
  "Staircase": {
    "confidence": [...],
    "target": [...],
    "stretch": [...]
  }
}
```

**Invalid handle:**
```json
{
  "error": "invalid_handle",
  "message": "'me' is not a valid Codeforces handle. Check for typos."
}
```

**Not enough data:**
```json
{
  "handle": "newuser",
  "diagnosis": "Not enough data! The Algo-Coach needs at least 15 submissions.",
  "action_plan": {
    "message": "Start with the fundamentals.",
    "recommended_problem": "Watermelon",
    "link": "https://codeforces.com/problemset/problem/4/A"
  }
}
```

---

## Known Limitations

- **Last 100 submissions only** — weakness detection uses a recency window. Old failures may still show if they're in the last 100. For active users this is a few weeks of data, which is a reasonable signal.
- **Render free tier cold starts** — the backend sleeps after 15 minutes of inactivity and takes ~30 seconds to wake on the next request. The frontend shows a `SERVER WAKING UP` message with instructions.
- **Ephemeral cache on Render** — the 24-hour problem cache resets on every service restart. Within any active session, cache works correctly; the first request after a cold start re-fetches the database.
- **English only** — UI and handle lookup are English-only.
- **No auth / history** — recommendations are stateless. Every analysis reads fresh from your current CF data.

---

## Planned (v3)

- [ ] Submission history chart — visualize tag failure rates over time
- [ ] Handle comparison — compare weaknesses side by side with a friend
- [ ] Filter by contest type (Div. 1 / Div. 2 / Educational)
