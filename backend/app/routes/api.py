from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.data_manager import DataManager
from app.database import (
    save_favorite,
    remove_favorite,
    get_favorites,
    save_recommendation_pair,
    get_saved_recommendations,
    delete_saved_recommendation
)

router = APIRouter(prefix="/api")

class RecommendRequest(BaseModel):
    seed_track_id: str
    n_recommendations: int = Field(default=10, ge=1, le=50)
    filter_genre: Optional[str] = "all"
    min_popularity: Optional[int] = Field(default=0, ge=0, le=100)

class FavoriteRequest(BaseModel):
    track_id: str
    track_name: str
    track_artist: str
    playlist_genre: Optional[str] = ""
    playlist_subgenre: Optional[str] = ""
    track_popularity: Optional[int] = 0
    danceability: Optional[float] = 0.0
    energy: Optional[float] = 0.0
    tempo: Optional[float] = 0.0
    valence: Optional[float] = 0.0

class SaveRecommendationRequest(BaseModel):
    seed_track_id: str
    seed_track_name: str
    seed_artist: str
    recommended_track_id: str
    recommended_track_name: str
    recommended_artist: str
    genre: Optional[str] = ""
    similarity_score: float
    notes: Optional[str] = ""

@router.get("/dashboard")
def get_dashboard():
    dm = DataManager.get_instance()
    return dm.dashboard_data

@router.get("/preprocessing")
def get_preprocessing():
    dm = DataManager.get_instance()
    return dm.preprocessing_report

@router.get("/dataset")
def get_dataset(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=5, le=100),
    search: Optional[str] = Query(None),
    genre: Optional[str] = Query("all"),
    subgenre: Optional[str] = Query("all"),
    min_popularity: Optional[int] = Query(0, ge=0, le=100),
    sort_by: Optional[str] = Query("track_popularity"),
    sort_order: Optional[str] = Query("desc")
):
    dm = DataManager.get_instance()
    df = dm.df

    # Filtering
    filtered = df
    if search:
        s = search.strip().lower()
        filtered = filtered[
            filtered['track_name'].str.lower().str.contains(s, na=False) |
            filtered['track_artist'].str.lower().str.contains(s, na=False)
        ]

    if genre and genre.lower() != "all":
        filtered = filtered[filtered['playlist_genre'].str.lower() == genre.lower()]

    if subgenre and subgenre.lower() != "all":
        filtered = filtered[filtered['playlist_subgenre'].str.lower() == subgenre.lower()]

    if min_popularity and min_popularity > 0:
        filtered = filtered[filtered['track_popularity'] >= min_popularity]

    # Sorting
    valid_sort_cols = [
        "track_popularity", "tempo", "energy", "danceability", "valence",
        "loudness", "acousticness", "speechiness", "duration_ms"
    ]
    sort_col = sort_by if sort_by in valid_sort_cols else "track_popularity"
    ascending = (sort_order.lower() == "asc")
    filtered = filtered.sort_values(by=sort_col, ascending=ascending)

    total_items = len(filtered)
    total_pages = max(1, (total_items + page_size - 1) // page_size)
    page_safe = min(page, total_pages)
    start_idx = (page_safe - 1) * page_size
    end_idx = start_idx + page_size

    sliced = filtered.iloc[start_idx:end_idx]

    items = []
    for _, row in sliced.iterrows():
        items.append({
            "track_id": str(row['track_id']),
            "track_name": str(row['track_name']),
            "track_artist": str(row['track_artist']),
            "playlist_genre": str(row['playlist_genre']).upper(),
            "playlist_subgenre": str(row['playlist_subgenre']),
            "popularity": int(row['track_popularity']),
            "danceability": float(row['danceability']),
            "energy": float(row['energy']),
            "tempo": float(row['tempo']),
            "valence": float(row['valence']),
            "loudness": float(row['loudness']),
            "acousticness": float(row['acousticness']),
            "instrumentalness": float(row['instrumentalness']),
            "speechiness": float(row['speechiness']),
            "duration_ms": int(row['duration_ms']),
            "cluster": int(row.get('cluster', 0))
        })

    return {
        "page": page_safe,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
        "items": items
    }

@router.get("/genres")
def get_genres():
    dm = DataManager.get_instance()
    return {
        "genres": dm.genres_data,
        "total_genres": len(dm.genres_data)
    }

@router.get("/analytics")
def get_analytics():
    dm = DataManager.get_instance()
    return dm.analytics_data

@router.get("/correlation")
def get_correlation():
    dm = DataManager.get_instance()
    return dm.correlation_data

@router.get("/clusters")
def get_clusters():
    dm = DataManager.get_instance()
    return dm.clustering_summary

@router.get("/clusters/evaluation")
def get_clusters_evaluation():
    dm = DataManager.get_instance()
    return {
        "evaluation": dm.clustering.evaluation_results,
        "optimal_k": dm.clustering.optimal_k,
        "explanation": "Optimal cluster k=6 is determined via the Elbow Method (identifying the plateau in WCSS inertia reduction) and supported by minimum Davies-Bouldin index and peak multi-cluster Silhouette score, closely aligning with the 6 foundational Spotify playlist genres."
    }

@router.get("/pca")
def get_pca():
    dm = DataManager.get_instance()
    return dm.pca_data

@router.post("/recommend")
def get_recommendations(req: RecommendRequest):
    dm = DataManager.get_instance()
    try:
        return dm.recommender.recommend(
            seed_track_id=req.seed_track_id,
            n_recommendations=req.n_recommendations,
            filter_genre=req.filter_genre,
            min_popularity=req.min_popularity
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/songs/search")
def search_songs(q: str = Query("", min_length=0), limit: int = Query(15, ge=1, le=50)):
    dm = DataManager.get_instance()
    return dm.recommender.search_songs(query=q, limit=limit)

@router.get("/insights")
def get_insights():
    dm = DataManager.get_instance()
    return {
        "insights": dm.insights_data
    }

# Favorites & Saved Recommendations Endpoints
@router.get("/favorites")
def list_favorites():
    return {"favorites": get_favorites()}

@router.post("/favorites")
def add_favorite(req: FavoriteRequest):
    success = save_favorite(req.dict())
    return {"success": success, "message": "Song added to favorites"}

@router.delete("/favorites/{track_id}")
def del_favorite(track_id: str):
    success = remove_favorite(track_id)
    return {"success": success, "message": "Song removed from favorites"}

@router.get("/recommendations/saved")
def list_saved_recommendations():
    return {"saved": get_saved_recommendations()}

@router.post("/recommendations/saved")
def add_saved_recommendation(req: SaveRecommendationRequest):
    row_id = save_recommendation_pair(
        seed_track_id=req.seed_track_id,
        seed_track_name=req.seed_track_name,
        seed_artist=req.seed_artist,
        rec_track_id=req.recommended_track_id,
        rec_track_name=req.recommended_track_name,
        rec_artist=req.recommended_artist,
        genre=req.genre,
        similarity_score=req.similarity_score,
        notes=req.notes
    )
    return {"success": True, "id": row_id, "message": "Recommendation saved"}

@router.delete("/recommendations/saved/{rec_id}")
def del_saved_recommendation(rec_id: int):
    success = delete_saved_recommendation(rec_id)
    return {"success": success, "message": "Saved recommendation deleted"}
