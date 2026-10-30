import os
import pickle
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, davies_bouldin_score
from typing import Dict, Any, List

CLUSTER_NAMES = {
    0: "Atmospheric & Chill Vibes",
    1: "High-Octane EDM & Festival Beats",
    2: "Groovy R&B & Urban Melodies",
    3: "Aggressive Rap & Fast Flow",
    4: "Acoustic Warmth & Folk Intimacy",
    5: "Heavy Rock & High-Loudness Drives"
}

class ClusteringModel:
    def __init__(self, saved_model_dir: str):
        self.saved_model_dir = saved_model_dir
        os.makedirs(saved_model_dir, exist_ok=True)
        self.kmeans: KMeans = None
        self.evaluation_results: List[Dict[str, Any]] = []
        self.cluster_profiles: List[Dict[str, Any]] = []
        self.optimal_k: int = 6

    def evaluate_k(self, X_scaled: np.ndarray, k_range: range = range(2, 9), sample_size: int = 5000) -> List[Dict[str, Any]]:
        results = []
        n_samples = len(X_scaled)
        
        # Consistent sampling for silhouette calculation to keep API blazing fast
        if n_samples > sample_size:
            np.random.seed(42)
            idx = np.random.choice(n_samples, sample_size, replace=False)
            X_eval = X_scaled[idx]
        else:
            X_eval = X_scaled
            idx = np.arange(n_samples)

        for k in k_range:
            km = KMeans(n_clusters=k, random_state=42, n_init=5)
            labels = km.fit_predict(X_scaled)
            sample_labels = labels[idx]
            
            sil = float(round(silhouette_score(X_eval, sample_labels), 4))
            db = float(round(davies_bouldin_score(X_eval, sample_labels), 4))
            
            results.append({
                "k": k,
                "inertia": float(round(km.inertia_, 2)),
                "silhouette_score": sil,
                "davies_bouldin_index": db
            })

        self.evaluation_results = results
        return results

    def fit(self, X_scaled: np.ndarray, df: pd.DataFrame, feature_names: List[str], k: int = 6) -> np.ndarray:
        self.optimal_k = k
        self.kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = self.kmeans.fit_predict(X_scaled)
        
        # Save model
        model_path = os.path.join(self.saved_model_dir, "kmeans_model.pkl")
        with open(model_path, "wb") as f:
            pickle.dump(self.kmeans, f)

        # Build cluster characteristics
        df_work = df.copy()
        df_work["cluster"] = labels

        profiles = []
        total_songs = len(df_work)

        for c_id in range(k):
            c_df = df_work[df_work["cluster"] == c_id]
            c_count = len(c_df)
            c_pct = round((c_count / total_songs) * 100, 2)
            
            # Average raw features
            raw_means = {f: float(round(c_df[f].mean(), 4)) for f in feature_names}
            
            # Normalized audio features between 0 and 1 for radar charts
            radar_features = {
                "danceability": float(round(c_df["danceability"].mean(), 3)),
                "energy": float(round(c_df["energy"].mean(), 3)),
                "speechiness": float(round(c_df["speechiness"].mean(), 3)),
                "acousticness": float(round(c_df["acousticness"].mean(), 3)),
                "instrumentalness": float(round(c_df["instrumentalness"].mean(), 3)),
                "liveness": float(round(c_df["liveness"].mean(), 3)),
                "valence": float(round(c_df["valence"].mean(), 3)),
                "tempo_norm": float(round(min(1.0, c_df["tempo"].mean() / 200.0), 3)),
                "loudness_norm": float(round((c_df["loudness"].mean() + 60) / 60.0, 3))
            }
            
            # Genre distribution in this cluster
            genre_dist = c_df["playlist_genre"].value_counts().to_dict()
            top_genre = list(genre_dist.keys())[0] if genre_dist else "Unknown"

            # Top representative songs (closest to centroid in scaled space)
            c_indices = np.where(labels == c_id)[0]
            c_scaled = X_scaled[c_indices]
            centroid = self.kmeans.cluster_centers_[c_id]
            dists = np.linalg.norm(c_scaled - centroid, axis=1)
            closest_local_idx = np.argsort(dists)[:5]
            representative_tracks = []
            for cli in closest_local_idx:
                global_idx = c_indices[cli]
                row = df_work.iloc[global_idx]
                representative_tracks.append({
                    "track_id": str(row["track_id"]),
                    "track_name": str(row["track_name"]),
                    "track_artist": str(row["track_artist"]),
                    "playlist_genre": str(row["playlist_genre"]),
                    "playlist_subgenre": str(row["playlist_subgenre"]),
                    "popularity": int(row["track_popularity"]),
                    "energy": float(row["energy"]),
                    "danceability": float(row["danceability"]),
                    "distance": float(round(dists[cli], 3))
                })

            profile_name = CLUSTER_NAMES.get(c_id, f"Cluster #{c_id + 1} Profile")
            
            profiles.append({
                "cluster_id": c_id,
                "name": profile_name,
                "song_count": c_count,
                "percentage": c_pct,
                "top_genre": top_genre,
                "genre_breakdown": genre_dist,
                "audio_means": raw_means,
                "radar_features": radar_features,
                "representative_tracks": representative_tracks
            })

        self.cluster_profiles = profiles
        return labels

    def get_clustering_summary(self) -> Dict[str, Any]:
        return {
            "optimal_k": self.optimal_k,
            "profiles": self.cluster_profiles,
            "evaluation": self.evaluation_results
        }
