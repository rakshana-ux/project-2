import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional

class RecommendationEngine:
    def __init__(self, df: pd.DataFrame, X_scaled: np.ndarray, feature_names: List[str]):
        self.df = df
        self.feature_names = feature_names
        
        # Precompute normalized feature vectors for instant cosine similarity dot product
        norms = np.linalg.norm(X_scaled, axis=1, keepdims=True)
        # Avoid division by zero
        norms[norms == 0] = 1.0
        self.X_normalized = X_scaled / norms

        # Quick lookup dictionaries
        self.id_to_idx = {str(row['track_id']): idx for idx, row in df.iterrows()}

    def search_songs(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        query_str = query.strip().lower()
        if not query_str:
            # Return top popular songs if empty query
            matches = self.df.sort_values(by="track_popularity", ascending=False).head(limit)
        else:
            # Match track_name or track_artist
            mask = (
                self.df['track_name'].str.lower().str.contains(query_str, na=False) |
                self.df['track_artist'].str.lower().str.contains(query_str, na=False)
            )
            matches = self.df[mask].sort_values(by="track_popularity", ascending=False).head(limit)

        results = []
        for _, row in matches.iterrows():
            results.append({
                "track_id": str(row['track_id']),
                "track_name": str(row['track_name']),
                "track_artist": str(row['track_artist']),
                "playlist_genre": str(row['playlist_genre']).upper(),
                "playlist_subgenre": str(row['playlist_subgenre']),
                "popularity": int(row['track_popularity']),
                "danceability": float(row['danceability']),
                "energy": float(row['energy']),
                "valence": float(row['valence']),
                "tempo": float(row['tempo'])
            })
        return results

    def recommend(
        self,
        seed_track_id: str,
        n_recommendations: int = 10,
        filter_genre: Optional[str] = None,
        min_popularity: int = 0
    ) -> Dict[str, Any]:
        if seed_track_id not in self.id_to_idx:
            raise ValueError(f"Seed track ID '{seed_track_id}' not found in catalog.")

        seed_idx = self.id_to_idx[seed_track_id]
        seed_row = self.df.iloc[seed_idx]
        seed_vector = self.X_normalized[seed_idx]

        # Calculate cosine similarity with all tracks in vectorized speed (~2ms)
        similarities = np.dot(self.X_normalized, seed_vector)

        # Build candidate mask
        mask = np.ones(len(self.df), dtype=bool)
        # Exclude exact seed track
        mask[seed_idx] = False

        if min_popularity > 0:
            mask = mask & (self.df['track_popularity'] >= min_popularity)

        if filter_genre and filter_genre.lower() != "all":
            mask = mask & (self.df['playlist_genre'].str.lower() == filter_genre.lower())

        candidate_indices = np.where(mask)[0]
        if len(candidate_indices) == 0:
            return {
                "seed_song": self._format_song_dict(seed_row),
                "recommendations": []
            }

        candidate_similarities = similarities[candidate_indices]
        
        # Get top N indices
        top_local_idx = np.argsort(candidate_similarities)[::-1][:n_recommendations]
        top_indices = candidate_indices[top_local_idx]

        recommendations = []
        for rank, idx in enumerate(top_indices, start=1):
            row = self.df.iloc[idx]
            raw_sim = float(similarities[idx])
            # Map similarity from [-1, 1] to [0%, 100%]
            sim_percentage = float(round(max(0.0, (raw_sim + 1) / 2) * 100, 1))

            recommendations.append({
                "rank": rank,
                "track_id": str(row['track_id']),
                "track_name": str(row['track_name']),
                "track_artist": str(row['track_artist']),
                "playlist_genre": str(row['playlist_genre']).upper(),
                "playlist_subgenre": str(row['playlist_subgenre']),
                "popularity": int(row['track_popularity']),
                "similarity_score": float(round(raw_sim, 4)),
                "similarity_percentage": sim_percentage,
                "audio_features": {
                    "danceability": float(row['danceability']),
                    "energy": float(row['energy']),
                    "loudness": float(row['loudness']),
                    "valence": float(row['valence']),
                    "tempo": float(row['tempo']),
                    "acousticness": float(row['acousticness']),
                    "instrumentalness": float(row['instrumentalness']),
                    "speechiness": float(row['speechiness'])
                }
            })

        return {
            "seed_song": self._format_song_dict(seed_row),
            "recommendations": recommendations,
            "total_found": len(recommendations)
        }

    def _format_song_dict(self, row: pd.Series) -> Dict[str, Any]:
        return {
            "track_id": str(row['track_id']),
            "track_name": str(row['track_name']),
            "track_artist": str(row['track_artist']),
            "playlist_genre": str(row['playlist_genre']).upper(),
            "playlist_subgenre": str(row['playlist_subgenre']),
            "popularity": int(row['track_popularity']),
            "audio_features": {
                "danceability": float(row['danceability']),
                "energy": float(row['energy']),
                "loudness": float(row['loudness']),
                "valence": float(row['valence']),
                "tempo": float(row['tempo']),
                "acousticness": float(row['acousticness']),
                "instrumentalness": float(row['instrumentalness']),
                "speechiness": float(row['speechiness'])
            }
        }
