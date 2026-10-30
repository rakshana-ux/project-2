import pandas as pd
from typing import Dict, Any, List

class InsightsGenerator:
    def generate(self, df: pd.DataFrame, clustering_summary: Dict[str, Any], correlation_summary: Dict[str, Any]) -> List[Dict[str, Any]]:
        insights = []

        # 1. Highest Energy Genre
        genre_energy = df.groupby('playlist_genre')['energy'].mean().sort_values(ascending=False)
        top_energy_genre = genre_energy.index[0].upper()
        top_energy_val = round(genre_energy.iloc[0], 3)
        lowest_energy_genre = genre_energy.index[-1].upper()
        lowest_energy_val = round(genre_energy.iloc[-1], 3)

        insights.append({
            "category": "Acoustic Energy & Intensity",
            "title": f"{top_energy_genre} Reigns as the Highest-Energy Genre",
            "stat": f"{top_energy_val} Avg Energy",
            "badge": "Peak Intensity",
            "description": f"Tracks classified under {top_energy_genre} exhibit the highest average energy ({top_energy_val}), followed by {genre_energy.index[1].upper()}. In contrast, {lowest_energy_genre} registers the lowest at {lowest_energy_val}, demonstrating a significant dynamic range across Spotify playlists."
        })

        # 2. Highest Danceability Genre
        genre_dance = df.groupby('playlist_genre')['danceability'].mean().sort_values(ascending=False)
        top_dance_genre = genre_dance.index[0].upper()
        top_dance_val = round(genre_dance.iloc[0], 3)
        runner_up_dance = genre_dance.index[1].upper()

        insights.append({
            "category": "Rhythmic Motion",
            "title": f"{top_dance_genre} Dominates Danceability Benchmarks",
            "stat": f"{top_dance_val} Avg Danceability",
            "badge": "Groove Champion",
            "description": f"With an average danceability score of {top_dance_val}, {top_dance_genre} edges out {runner_up_dance} ({round(genre_dance.iloc[1], 3)}) as the most rhythmically stable and movement-inducing genre in the dataset."
        })

        # 3. Peak Popularity Highlights
        top_popular_row = df.sort_values(by="track_popularity", ascending=False).iloc[0]
        top_artist_popularity = df.groupby('track_artist')['track_popularity'].mean().loc[lambda x: df['track_artist'].value_counts() >= 5].sort_values(ascending=False)
        
        insights.append({
            "category": "Commercial Popularity",
            "title": f"Top Track: '{top_popular_row['track_name']}' by {top_popular_row['track_artist']}",
            "stat": f"{int(top_popular_row['track_popularity'])}/100 Popularity",
            "badge": "Viral Sensation",
            "description": f"Leading the 32k+ catalog with peak popularity, this {top_popular_row['playlist_genre'].upper()} track pairs high danceability ({round(top_popular_row['danceability'], 2)}) with optimized loudness ({round(top_popular_row['loudness'], 1)} dB) fitting algorithmic playlist resonance."
        })

        # 4. Feature Correlation Discoveries
        strongest_pos = correlation_summary.get("summary", {}).get("strongest_positive")
        strongest_neg = correlation_summary.get("summary", {}).get("strongest_negative")
        if strongest_pos and strongest_neg:
            insights.append({
                "category": "Acoustic Correlation Patterns",
                "title": f"Decibel Compression vs. Dynamic Range Trade-off",
                "stat": f"r = {strongest_pos['correlation']}",
                "badge": "Acoustic Coupling",
                "description": f"The strongest positive correlation exists between {strongest_pos['feature_1'].capitalize()} and {strongest_pos['feature_2'].capitalize()} (r = {strongest_pos['correlation']}), while {strongest_neg['feature_1'].capitalize()} and {strongest_neg['feature_2'].capitalize()} show the sharpest antagonistic trade-off (r = {strongest_neg['correlation']})."
            })

        # 5. Cluster Segmentation Architecture
        profiles = clustering_summary.get("profiles", [])
        if profiles:
            largest_cluster = max(profiles, key=lambda p: p["song_count"])
            insights.append({
                "category": "Unsupervised Cluster Intelligence",
                "title": f"Cluster Architecture: '{largest_cluster['name']}' Leads Volume",
                "stat": f"{largest_cluster['percentage']}% of Catalog",
                "badge": "Cluster Majority",
                "description": f"K-Means grouped {largest_cluster['song_count']:,} tracks into '{largest_cluster['name']}', primarily driven by {largest_cluster['top_genre'].upper()} tracks characterized by steady tempo and sustained vocal rhythmic patterns."
            })

        # 6. Valence & Mood Polarity
        genre_valence = df.groupby('playlist_genre')['valence'].mean().sort_values(ascending=False)
        insights.append({
            "category": "Emotional Valence & Mood",
            "title": f"{genre_valence.index[0].upper()} Radiates Highest Emotional Positivity",
            "stat": f"{round(genre_valence.iloc[0], 3)} Avg Valence",
            "badge": "Euphoric Vibe",
            "description": f"Musical happiness and euphoric atmosphere peak within {genre_valence.index[0].upper()} ({round(genre_valence.iloc[0], 3)}), contrasting sharply with more melancholic or introspective productions found in {genre_valence.index[-1].upper()} ({round(genre_valence.iloc[-1], 3)})."
        })

        return insights
