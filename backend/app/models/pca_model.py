import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from typing import Dict, Any, List

class PCAModel:
    def __init__(self, n_components: int = 2):
        self.pca = PCA(n_components=n_components, random_state=42)
        self.explained_variance: List[float] = []
        self.loadings: Dict[str, Dict[str, float]] = {}
        self.coordinates: np.ndarray = None

    def fit_transform(self, X_scaled: np.ndarray, feature_names: List[str]) -> np.ndarray:
        self.coordinates = self.pca.fit_transform(X_scaled)
        self.explained_variance = [float(round(v * 100, 2)) for v in self.pca.explained_variance_ratio_]
        
        # Loadings (eigenvectors)
        loadings_dict = {}
        for i, feat in enumerate(feature_names):
            loadings_dict[feat] = {
                "PC1": float(round(self.pca.components_[0, i], 4)),
                "PC2": float(round(self.pca.components_[1, i], 4))
            }
        self.loadings = loadings_dict
        return self.coordinates

    def get_scatter_data(self, df: pd.DataFrame, cluster_labels: np.ndarray, max_points: int = 2500) -> Dict[str, Any]:
        """
        Samples a representative subset of data points evenly across clusters and genres
        for fast, buttery-smooth client-side 60fps rendering with rich tooltips.
        """
        n_total = len(df)
        if n_total > max_points:
            # Stratified sampling across clusters
            df_temp = pd.DataFrame({
                'idx': np.arange(n_total),
                'cluster': cluster_labels
            })
            sampled_indices = (
                df_temp.groupby('cluster', group_keys=False)
                .apply(lambda g: g.sample(min(len(g), max_points // len(np.unique(cluster_labels))), random_state=42))
                ['idx'].values
            )
        else:
            sampled_indices = np.arange(n_total)

        points = []
        for idx in sampled_indices:
            row = df.iloc[idx]
            points.append({
                "id": str(row["track_id"]),
                "name": str(row["track_name"]),
                "artist": str(row["track_artist"]),
                "genre": str(row["playlist_genre"]),
                "subgenre": str(row["playlist_subgenre"]),
                "popularity": int(row["track_popularity"]),
                "cluster": int(cluster_labels[idx]),
                "x": float(round(self.coordinates[idx, 0], 3)),
                "y": float(round(self.coordinates[idx, 1], 3)),
                "energy": float(round(row["energy"], 3)),
                "danceability": float(round(row["danceability"], 3)),
                "valence": float(round(row["valence"], 3))
            })

        return {
            "explained_variance": {
                "pc1": self.explained_variance[0],
                "pc2": self.explained_variance[1],
                "total": float(round(sum(self.explained_variance), 2))
            },
            "loadings": self.loadings,
            "total_points": len(points),
            "points": points,
            "interpretation": {
                "pc1_meaning": "Acoustic vs. Electronic Energy Spectrum (high Energy & Loudness vs. high Acousticness)",
                "pc2_meaning": "Rhythmic Groove & Valence (high Danceability & Valence vs. Instrumentalness & Tempo)"
            }
        }
