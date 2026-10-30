import os
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional

from app.preprocessing.pipeline import PreprocessingPipeline, AUDIO_FEATURES
from app.models.clustering import ClusteringModel
from app.models.pca_model import PCAModel
from app.analytics.correlations import CorrelationAnalyzer
from app.analytics.eda import EDAAnalyzer
from app.analytics.insights import InsightsGenerator
from app.recommendations.engine import RecommendationEngine
from app.database import init_db

class DataManager:
    _instance: Optional['DataManager'] = None

    def __init__(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.dataset_path = os.path.join(base_dir, "dataset", "spotify dataset.csv")
        self.saved_model_dir = os.path.join(base_dir, "saved_models")

        self.df: pd.DataFrame = None
        self.X_scaled: np.ndarray = None
        self.scaler = None
        self.cluster_labels: np.ndarray = None

        self.pipeline: PreprocessingPipeline = None
        self.clustering: ClusteringModel = None
        self.pca: PCAModel = None
        self.correlation: CorrelationAnalyzer = None
        self.eda: EDAAnalyzer = None
        self.insights_gen: InsightsGenerator = None
        self.recommender: RecommendationEngine = None

        # Cached analytics payloads
        self.preprocessing_report: Dict[str, Any] = {}
        self.dashboard_data: Dict[str, Any] = {}
        self.analytics_data: Dict[str, Any] = {}
        self.correlation_data: Dict[str, Any] = {}
        self.clustering_summary: Dict[str, Any] = {}
        self.pca_data: Dict[str, Any] = {}
        self.insights_data: list = []
        self.genres_data: list = []

        self.initialized = False

    @classmethod
    def get_instance(cls) -> 'DataManager':
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def initialize(self):
        if self.initialized:
            return

        print("[INFO] Initializing Spotify Genre Lab Data Manager...")
        
        # 1. Initialize SQLite Database
        init_db()

        # 2. Run Preprocessing Pipeline
        print("  [1/6] Running Data Preprocessing Pipeline...")
        self.pipeline = PreprocessingPipeline(self.dataset_path)
        self.df, self.X_scaled, self.scaler = self.pipeline.run()
        self.preprocessing_report = self.pipeline.get_preprocessing_report()

        # 3. Clustering & Model Evaluation
        print("  [2/6] Evaluating & Fitting K-Means Clustering...")
        self.clustering = ClusteringModel(self.saved_model_dir)
        self.clustering.evaluate_k(self.X_scaled, k_range=range(2, 9), sample_size=5000)
        self.cluster_labels = self.clustering.fit(self.X_scaled, self.df, AUDIO_FEATURES, k=6)
        self.df['cluster'] = self.cluster_labels
        self.clustering_summary = self.clustering.get_clustering_summary()

        # 4. Dimensionality Reduction (PCA)
        print("  [3/6] Computing Principal Component Analysis (PCA)...")
        self.pca = PCAModel(n_components=2)
        self.pca.fit_transform(self.X_scaled, AUDIO_FEATURES)
        self.pca_data = self.pca.get_scatter_data(self.df, self.cluster_labels, max_points=2500)

        # 5. Correlation & EDA Analytics
        print("  [4/6] Generating Correlation Matrix & EDA Distributions...")
        self.correlation = CorrelationAnalyzer(AUDIO_FEATURES)
        self.correlation_data = self.correlation.calculate(self.df)

        self.eda = EDAAnalyzer(AUDIO_FEATURES)
        self.dashboard_data = self.eda.get_dashboard_summary(self.df)
        self.analytics_data = self.eda.get_full_analytics(self.df)

        # 6. Insights & Recommender Engine
        print("  [5/6] Generating Dynamic Insights & Initializing AI Recommender...")
        self.insights_gen = InsightsGenerator()
        self.insights_data = self.insights_gen.generate(self.df, self.clustering_summary, self.correlation_data)

        self.recommender = RecommendationEngine(self.df, self.X_scaled, AUDIO_FEATURES)

        # Build Genre Segmentation metadata
        self._build_genre_segmentation_data()

        self.initialized = True
        print("[SUCCESS] Spotify Genre Lab Data Manager successfully initialized!")

    def _build_genre_segmentation_data(self):
        genres = []
        for genre, grp in self.df.groupby('playlist_genre'):
            genre_name = genre.upper()
            subgenres_list = list(grp['playlist_subgenre'].unique())
            
            # Cluster composition in this genre
            cluster_counts = grp['cluster'].value_counts().to_dict()
            cluster_comp = [
                {"cluster_id": int(c_id), "count": int(count), "percentage": float(round((count / len(grp)) * 100, 1))}
                for c_id, count in sorted(cluster_counts.items())
            ]

            genres.append({
                "genre": genre_name,
                "track_count": len(grp),
                "subgenres": subgenres_list,
                "avg_popularity": float(round(grp['track_popularity'].mean(), 1)),
                "audio_profile": {
                    "danceability": float(round(grp['danceability'].mean(), 3)),
                    "energy": float(round(grp['energy'].mean(), 3)),
                    "loudness": float(round(grp['loudness'].mean(), 2)),
                    "valence": float(round(grp['valence'].mean(), 3)),
                    "tempo": float(round(grp['tempo'].mean(), 1)),
                    "acousticness": float(round(grp['acousticness'].mean(), 3)),
                    "speechiness": float(round(grp['speechiness'].mean(), 3)),
                    "instrumentalness": float(round(grp['instrumentalness'].mean(), 3))
                },
                "cluster_composition": cluster_comp
            })
        self.genres_data = genres
