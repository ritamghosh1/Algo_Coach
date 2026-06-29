# AlgoCoach

```bash
$ ./algo_coach --init
```

A machine-learning-powered weakness detector and problem recommender for competitive programmers on Codeforces.

AlgoCoach analyzes your recent Codeforces submissions, identifies the algorithmic concepts you struggle with the most, and uses a K-Nearest Neighbors (KNN) algorithm to recommend the exact 5 problems you should solve next to improve.

**Live Demo:** [AlgoCoach on Vercel](https://algo-coach-navy.vercel.app/)

## How It Works

AlgoCoach doesn't just give you random problems. It builds a mathematical profile of your skills:

1. **Data Fetching:** Pulls your last 100 submissions via the Codeforces API.
2. **Weakness Diagnosis:** Filters out your failed submissions and calculates a failure rate across all problem tags (e.g., `dp`, `graphs`, `math`).
3. **Feature Vectorization:** Normalizes problem data using two heavily weighted features:
   - **Tag Match (75% weight):** How well a problem covers your top 3 weakest tags.
   - **Target Rating (25% weight):** Filters problems to a window of ±300 points around your current rating + 100.
4. **KNN Recommendation:** Uses scikit-learn's K-Nearest Neighbors (Euclidean distance) to plot you in the problem space and find the 5 closest matches to your specific learning needs.

## Tech Stack

- **Frontend:** Vercel
- **UI:** React (Vite)
- **Styling:** Custom terminal-inspired CSS & UI
- **Backend:** Render
- **API:** Python & FastAPI
- **Machine Learning:** scikit-learn
- **Data parsing:** NumPy
- **Server:** Uvicorn (ASGI web server)

## Local Development Setup

If you want to run this project locally, follow these steps.

### 1. Clone the repository

```bash
git clone https://github.com/ritamghosh1/Algo_Coach.git
cd Algo_Coach
```

### 2. Backend Setup

```bash
cd Backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

The backend API will run at: `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

The frontend will run at: `http://localhost:5173`
