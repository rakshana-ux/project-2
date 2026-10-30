import pandas as pd
import numpy as np
from typing import Dict, Any, List

class EDAAnalyzer:
    def __init__(self, audio_features: List[str]):
        self.features = audio_features

    def get_dashboard_summary(self, df: pd.DataFrame) -> Dict[str, Any]:
        total_songs = len(df)
        total_artists = int(df['track_artist'].nunique())
        total_genres = int(df['playlist_genre'].nunique())
        total_subgenres = int(df['playlist_subgenre'].nunique())

        avg_popularity = float(round(df['track_popularity'].mean(), 1))
        avg_danceability = float(round(df['danceability'].mean(), 3))
        avg_energy = float(round(df['energy'].mean(), 3))
        avg_tempo = float(round(df['tempo'].mean(), 1))

        # Genre distribution
        genre_counts = df['playlist_genre'].value_counts()
        genre_dist = [
            {
                "genre": genre.upper(),
                "count": int(count),
                "percentage": float(round((count / total_songs) * 100, 1)),
                "avg_popularity": float(round(df[df['playlist_genre'] == genre]['track_popularity'].mean(), 1)),
                "avg_energy": float(round(df[df['playlist_genre'] == genre]['energy'].mean(), 3)),
                "avg_danceability": float(round(df[df['playlist_genre'] == genre]['danceability'].mean(), 3))
            }
            for genre, count in genre_counts.items()
        ]

        # Top 10 popular songs
        top_songs_df = df.sort_values(by="track_popularity", ascending=False).drop_duplicates(subset=['track_name', 'track_artist']).head(10)
        top_10_songs = [
            {
                "track_id": str(row['track_id']),
                "track_name": str(row['track_name']),
                "artist": str(row['track_artist']),
                "genre": str(row['playlist_genre']).upper(),
                "subgenre": str(row['playlist_subgenre']),
                "popularity": int(row['track_popularity']),
                "danceability": float(row['danceability']),
                "energy": float(row['energy']),
                "tempo": float(row['tempo'])
            }
            for _, row in top_songs_df.iterrows()
        ]

        # Top 10 artists by song count
        artist_counts = df['track_artist'].value_counts().head(10)
        top_10_artists = [
            {
                "artist": artist,
                "track_count": int(count),
                "avg_popularity": float(round(df[df['track_artist'] == artist]['track_popularity'].mean(), 1))
            }
            for artist, count in artist_counts.items()
        ]

        # Audio features overall averages for radar chart
        radar_overview = [
            {"feature": "Danceability", "value": avg_danceability, "benchmark": 0.65},
            {"feature": "Energy", "value": avg_energy, "benchmark": 0.70},
            {"feature": "Speechiness", "value": float(round(df['speechiness'].mean(), 3)), "benchmark": 0.10},
            {"feature": "Acousticness", "value": float(round(df['acousticness'].mean(), 3)), "benchmark": 0.18},
            {"feature": "Valence", "value": float(round(df['valence'].mean(), 3)), "benchmark": 0.51},
            {"feature": "Liveness", "value": float(round(df['liveness'].mean(), 3)), "benchmark": 0.19}
        ]

        return {
            "metrics": {
                "total_songs": total_songs,
                "total_artists": total_artists,
                "total_genres": total_genres,
                "total_subgenres": total_subgenres,
                "avg_popularity": avg_popularity,
                "avg_danceability": avg_danceability,
                "avg_energy": avg_energy,
                "avg_tempo": avg_tempo
            },
            "genre_distribution": genre_dist,
            "top_10_songs": top_10_songs,
            "top_10_artists": top_10_artists,
            "radar_overview": radar_overview
        }

    def get_full_analytics(self, df: pd.DataFrame) -> Dict[str, Any]:
        # Feature histograms / distribution bins
        distributions = {}
        for feat in ['danceability', 'energy', 'acousticness', 'valence', 'speechiness', 'instrumentalness']:
            counts, bin_edges = np.histogram(df[feat], bins=10, range=(0.0, 1.0))
            distributions[feat] = [
                {"bin": f"{round(bin_edges[i], 1)}-{round(bin_edges[i+1], 1)}", "count": int(counts[i])}
                for i in range(len(counts))
            ]

        # Popularity distribution (0 to 100)
        pop_counts, pop_bins = np.histogram(df['track_popularity'], bins=10, range=(0, 100))
        distributions['track_popularity'] = [
            {"bin": f"{int(pop_bins[i])}-{int(pop_bins[i+1])}", "count": int(pop_counts[i])}
            for i in range(len(pop_counts))
        ]

        # Tempo distribution (50 to 220 bpm)
        tempo_counts, tempo_bins = np.histogram(df['tempo'], bins=10, range=(50, 220))
        distributions['tempo'] = [
            {"bin": f"{int(tempo_bins[i])}-{int(tempo_bins[i+1])} bpm", "count": int(tempo_counts[i])}
            for i in range(len(tempo_counts))
        ]

        # Loudness distribution (-30 to 0 dB)
        loud_counts, loud_bins = np.histogram(df['loudness'], bins=10, range=(-30, 0))
        distributions['loudness'] = [
            {"bin": f"{int(loud_bins[i])} to {int(loud_bins[i+1])} dB", "count": int(loud_counts[i])}
            for i in range(len(loud_counts))
        ]

        # Genre-wise comparisons
        genre_groups = df.groupby('playlist_genre')
        genre_comparisons = []
        for genre, grp in genre_groups:
            genre_comparisons.append({
                "genre": genre.upper(),
                "song_count": len(grp),
                "avg_popularity": float(round(grp['track_popularity'].mean(), 1)),
                "avg_danceability": float(round(grp['danceability'].mean(), 3)),
                "avg_energy": float(round(grp['energy'].mean(), 3)),
                "avg_tempo": float(round(grp['tempo'].mean(), 1)),
                "avg_loudness": float(round(grp['loudness'].mean(), 2)),
                "avg_valence": float(round(grp['valence'].mean(), 3)),
                "avg_acousticness": float(round(grp['acousticness'].mean(), 3)),
                "avg_speechiness": float(round(grp['speechiness'].mean(), 3)),
                "avg_instrumentalness": float(round(grp['instrumentalness'].mean(), 3))
            })

        # Subgenre distribution grouped by genre
        subgenres = []
        for (genre, subgenre), grp in df.groupby(['playlist_genre', 'playlist_subgenre']):
            subgenres.append({
                "genre": genre.upper(),
                "subgenre": subgenre,
                "count": len(grp),
                "avg_popularity": float(round(grp['track_popularity'].mean(), 1)),
                "avg_energy": float(round(grp['energy'].mean(), 3)),
                "avg_danceability": float(round(grp['danceability'].mean(), 3))
            })

        # Top 15 Artists
        top_artists = [
            {
                "artist": artist,
                "count": int(count),
                "avg_popularity": float(round(df[df['track_artist'] == artist]['track_popularity'].mean(), 1)),
                "primary_genre": df[df['track_artist'] == artist]['playlist_genre'].mode()[0].upper()
            }
            for artist, count in df['track_artist'].value_counts().head(15).items()
        ]

        # Top Playlists by song count
        top_playlists = [
            {
                "playlist_name": name,
                "count": int(count),
                "genre": df[df['playlist_name'] == name]['playlist_genre'].mode()[0].upper()
            }
            for name, count in df['playlist_name'].value_counts().head(12).items()
        ]

        return {
            "distributions": distributions,
            "genre_comparisons": genre_comparisons,
            "subgenres": subgenres,
            "top_artists": top_artists,
            "top_playlists": top_playlists
        }
