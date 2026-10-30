import pandas as pd
import numpy as np
from typing import Dict, Any, List

class CorrelationAnalyzer:
    def __init__(self, audio_features: List[str]):
        self.features = audio_features

    def calculate(self, df: pd.DataFrame) -> Dict[str, Any]:
        # Compute Pearson correlation
        corr_matrix = df[self.features].corr(method="pearson").round(3)
        
        # Build matrix format for charts
        matrix_data = []
        for feat in self.features:
            row_dict = {"feature": feat}
            for other_feat in self.features:
                row_dict[other_feat] = float(corr_matrix.loc[feat, other_feat])
            matrix_data.append(row_dict)

        # Pairwise relationships
        pairs = []
        for i in range(len(self.features)):
            for j in range(i + 1, len(self.features)):
                f1 = self.features[i]
                f2 = self.features[j]
                val = float(corr_matrix.loc[f1, f2])
                
                # Determine relationship strength & interpretation
                if abs(val) >= 0.5:
                    strength = "Strong"
                elif abs(val) >= 0.25:
                    strength = "Moderate"
                else:
                    strength = "Weak"

                direction = "Positive" if val > 0 else "Negative"
                
                # Explanations for key relationships
                explanation = self._explain_pair(f1, f2, val)

                pairs.append({
                    "feature_1": f1,
                    "feature_2": f2,
                    "correlation": val,
                    "strength": strength,
                    "direction": direction,
                    "explanation": explanation
                })

        # Sort pairs by absolute correlation descending
        pairs.sort(key=lambda x: abs(x["correlation"]), reverse=True)

        return {
            "features": self.features,
            "matrix": matrix_data,
            "top_pairs": pairs[:12],
            "all_pairs": pairs,
            "summary": {
                "strongest_positive": pairs[0] if pairs and pairs[0]["correlation"] > 0 else next((p for p in pairs if p["correlation"] > 0), None),
                "strongest_negative": next((p for p in pairs if p["correlation"] < 0), None)
            }
        }

    def _explain_pair(self, f1: str, f2: str, val: float) -> str:
        pair_set = {f1, f2}
        if pair_set == {"energy", "loudness"}:
            return f"Songs with higher perceived loudness almost always feature intense dynamic energy (r = {val}). High decibel production directly fuels energetic master tracks."
        elif pair_set == {"energy", "acousticness"}:
            return f"A strong inverse relationship (r = {val}); acoustic unplugged instruments produce organic, subtle vibrations compared to compressed, synthetic electronic sounds."
        elif pair_set == {"danceability", "valence"}:
            return f"Tracks with higher musical positiveness and euphoric mood encourage bodily movement and dance rhythm (r = {val})."
        elif pair_set == {"loudness", "acousticness"}:
            return f"Heavily acoustic recordings feature wide dynamic range and lower peak limiting (r = {val}), whereas modern compressed masters maximize loudness."
        elif pair_set == {"valence", "energy"}:
            return f"Energetic, driving arrangements frequently induce cheerful, vibrant, and uplifting musical feelings (r = {val})."
        elif pair_set == {"danceability", "energy"}:
            return f"While energetic tracks are danceable, overly extreme tempo or hyper-fast beats can actually reduce steady rhythmic danceability (r = {val})."
        elif pair_set == {"instrumentalness", "loudness"}:
            return f"Instrumental and ambient recordings tend to be mastered more gently without modern vocal compression (r = {val})."
        elif pair_set == {"speechiness", "danceability"}:
            return f"Spoken-word and rap vocal cadences often align with strong urban rhythm and bouncy dance tempo (r = {val})."
        else:
            dir_str = "increase simultaneously" if val > 0 else "exhibit an inverse trade-off"
            return f"{f1.capitalize()} and {f2.capitalize()} {dir_str} (r = {val}), highlighting auditory balancing in Spotify production."
