# SPOTIFY GENRE LAB – Music Intelligence & Recommendation System

An AI-powered music intelligence and unsupervised machine learning web platform analyzing 32,833 authentic Spotify tracks.

## 🎵 Features
- **Executive Music Dashboard**: Real-time KPI telemetry, genre distributions, audio feature radar signatures, top songs and artists.
- **Dataset Explorer**: Search, filter by genre/subgenre, sort by audio characteristics, pagination, and detailed song modal views.
- **Data Preprocessing Pipeline**: Scrubbing missing records, deduplicating track IDs, boundary validation, and StandardScaler normalization.
- **Exploratory Data Analysis (EDA)**: Continuous distribution histograms across 10 audio features, genre comparisons, subgenre breakdown, and playlist metrics.
- **Correlation Matrix**: Interactive Pearson correlation heatmap with pairwise acoustic explanations.
- **K-Means Clustering**: Unsupervised clustering with Elbow curve (WCSS inertia), Silhouette scores, and Davies-Bouldin metrics confirming optimal $k=6$.
- **PCA 2D Space**: 2D Principal Component Analysis dimensionality reduction with feature loadings.
- **Genre Segmentation**: In-depth audio profiling and unsupervised cluster composition cross-tabulation across the 6 major Spotify genres.
- **AI Recommendation Engine**: Vectorized Cosine Similarity content-based filtering across scaled audio vectors.
- **Dynamic Music Insights**: Automated algorithmic takeaways derived directly from the statistical findings.
- **Favorites & Persistence**: SQLite-backed storage for saved songs and recommendation sessions.

## 🛠️ Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React, Framer Motion
- **Backend**: Python, FastAPI, Pandas, NumPy, Scikit-learn, Uvicorn, SQLite

## 🚀 Running Locally

### Backend:
```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
Interactive API docs: `http://127.0.0.1:8000/docs`

### Frontend:
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
Access in browser: `http://127.0.0.1:5173/`
