import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.data_manager import DataManager
from app.routes.api import router as api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize ML models and dataset on startup
    dm = DataManager.get_instance()
    dm.initialize()
    yield
    print("Shutting down Spotify Genre Lab API.")

app = FastAPI(
    title="SPOTIFY GENRE LAB – Music Intelligence & Recommendation API",
    description="High-performance backend for Spotify audio feature analytics, K-Means clustering, PCA, and AI recommendations.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Spotify Genre Lab – Music Intelligence API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False)
