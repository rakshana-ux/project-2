import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from typing import Dict, Any, Tuple

AUDIO_FEATURES = [
    'danceability',
    'energy',
    'loudness',
    'speechiness',
    'acousticness',
    'instrumentalness',
    'liveness',
    'valence',
    'tempo',
    'duration_ms'
]

METADATA_COLUMNS = [
    'track_id',
    'track_name',
    'track_artist',
    'track_popularity',
    'track_album_id',
    'track_album_name',
    'track_album_release_date',
    'playlist_name',
    'playlist_id',
    'playlist_genre',
    'playlist_subgenre'
]

class PreprocessingPipeline:
    def __init__(self, dataset_path: str):
        self.dataset_path = dataset_path
        self.scaler = StandardScaler()
        self.raw_stats: Dict[str, Any] = {}
        self.cleaned_stats: Dict[str, Any] = {}
        self.steps_summary: list = []

    def run(self) -> Tuple[pd.DataFrame, np.ndarray, StandardScaler]:
        if not os.path.exists(self.dataset_path):
            raise FileNotFoundError(f"Dataset not found at {self.dataset_path}")

        # Step 1: Load Raw Dataset
        df_raw = pd.read_csv(self.dataset_path)
        raw_rows, raw_cols = df_raw.shape
        missing_counts_raw = df_raw.isnull().sum().to_dict()

        self.raw_stats = {
            "total_records": raw_rows,
            "total_columns": raw_cols,
            "missing_values": {k: int(v) for k, v in missing_counts_raw.items() if v > 0},
            "columns": list(df_raw.columns),
            "duplicates_count": int(df_raw.duplicated(subset=['track_id']).sum()),
            "feature_summary": df_raw[AUDIO_FEATURES].describe().round(4).to_dict()
        }

        # Step 2: Handle Missing Values
        # Missing values are present in track_name (5), track_artist (5), track_album_name (5)
        df_clean = df_raw.dropna(subset=['track_name', 'track_artist', 'track_album_name']).copy()
        dropped_missing = raw_rows - len(df_clean)

        # Step 3: Remove Duplicate Records
        # A song can appear across multiple playlists; for recommendation and clustering we deduplicate on track_id
        # while keeping the first occurrence.
        initial_clean_rows = len(df_clean)
        df_dedup = df_clean.drop_duplicates(subset=['track_id'], keep='first').copy()
        removed_duplicates = initial_clean_rows - len(df_dedup)

        # Step 4: Handle Invalid / Corrupt Values
        # Ensure duration_ms > 10,000 (10 seconds) and tempo > 0
        df_valid = df_dedup[(df_dedup['duration_ms'] > 10000) & (df_dedup['tempo'] > 0)].copy()
        removed_invalid = len(df_dedup) - len(df_valid)

        # Step 5: Feature Extraction & Standardization
        X_raw = df_valid[AUDIO_FEATURES].values
        X_scaled = self.scaler.fit_transform(X_raw)

        # Build Cleaned Stats
        self.cleaned_stats = {
            "total_records": len(df_valid),
            "total_columns": len(df_valid.columns),
            "missing_values": {k: int(v) for k, v in df_valid.isnull().sum().items() if v > 0},
            "unique_artists": int(df_valid['track_artist'].nunique()),
            "unique_genres": int(df_valid['playlist_genre'].nunique()),
            "unique_subgenres": int(df_valid['playlist_subgenre'].nunique()),
            "audio_features": AUDIO_FEATURES,
            "feature_means": {f: float(round(df_valid[f].mean(), 4)) for f in AUDIO_FEATURES},
            "feature_stds": {f: float(round(df_valid[f].std(), 4)) for f in AUDIO_FEATURES},
            "scaled_means": {AUDIO_FEATURES[i]: float(round(X_scaled[:, i].mean(), 6)) for i in range(len(AUDIO_FEATURES))},
            "scaled_stds": {AUDIO_FEATURES[i]: float(round(X_scaled[:, i].std(), 6)) for i in range(len(AUDIO_FEATURES))}
        }

        # Step-by-step audit log
        self.steps_summary = [
            {
                "step": 1,
                "title": "Dataset Ingestion",
                "description": f"Loaded raw Spotify catalog containing {raw_rows:,} records across {raw_cols} attributes.",
                "affected_rows": raw_rows,
                "status": "completed"
            },
            {
                "step": 2,
                "title": "Missing Value Imputation & Scrubbing",
                "description": f"Identified missing song titles and artists; purged {dropped_missing} incomplete records.",
                "affected_rows": dropped_missing,
                "status": "completed"
            },
            {
                "step": 3,
                "title": "Track Deduplication",
                "description": f"Eliminated {removed_duplicates:,} playlist cross-entry duplicates based on unique track_id hashes.",
                "affected_rows": removed_duplicates,
                "status": "completed"
            },
            {
                "step": 4,
                "title": "Integrity & Boundary Validation",
                "description": f"Filtered {removed_invalid} anomalies with audio duration under 10s or zeroed tempo.",
                "affected_rows": removed_invalid,
                "status": "completed"
            },
            {
                "step": 5,
                "title": "Audio Feature Selection & Standardization",
                "description": f"Selected 10 continuous acoustic dimensions and transformed with StandardScaler (μ=0, σ=1).",
                "affected_rows": len(df_valid),
                "status": "completed"
            }
        ]

        # Reset index
        df_valid.reset_index(drop=True, inplace=True)
        return df_valid, X_scaled, self.scaler

    def get_preprocessing_report(self) -> Dict[str, Any]:
        return {
            "raw_stats": self.raw_stats,
            "cleaned_stats": self.cleaned_stats,
            "steps": self.steps_summary,
            "features": AUDIO_FEATURES
        }
