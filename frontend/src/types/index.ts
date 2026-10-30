export interface Song {
  track_id: string;
  track_name: string;
  track_artist: string;
  playlist_genre: string;
  playlist_subgenre: string;
  popularity: number;
  danceability: number;
  energy: number;
  tempo: number;
  valence: number;
  loudness: number;
  acousticness: number;
  instrumentalness: number;
  speechiness: number;
  duration_ms?: number;
  cluster?: number;
}

export interface DashboardMetrics {
  total_songs: number;
  total_artists: number;
  total_genres: number;
  total_subgenres: number;
  avg_popularity: number;
  avg_danceability: number;
  avg_energy: number;
  avg_tempo: number;
}

export interface GenreStat {
  genre: string;
  count: number;
  percentage: number;
  avg_popularity: number;
  avg_energy: number;
  avg_danceability: number;
}

export interface TopSong {
  track_id: string;
  track_name: string;
  artist: string;
  genre: string;
  subgenre: string;
  popularity: number;
  danceability: number;
  energy: number;
  tempo: number;
}

export interface TopArtist {
  artist: string;
  track_count: number;
  avg_popularity: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  genre_distribution: GenreStat[];
  top_10_songs: TopSong[];
  top_10_artists: TopArtist[];
  radar_overview: { feature: string; value: number; benchmark: number }[];
}

export interface PreprocessingReport {
  raw_stats: {
    total_records: number;
    total_columns: number;
    missing_values: Record<string, number>;
    columns: string[];
    duplicates_count: number;
    feature_summary: Record<string, Record<string, number>>;
  };
  cleaned_stats: {
    total_records: number;
    total_columns: number;
    missing_values: Record<string, number>;
    unique_artists: number;
    unique_genres: number;
    unique_subgenres: number;
    audio_features: string[];
    feature_means: Record<string, number>;
    feature_stds: Record<string, number>;
    scaled_means: Record<string, number>;
    scaled_stds: Record<string, number>;
  };
  steps: {
    step: number;
    title: string;
    description: string;
    affected_rows: number;
    status: string;
  }[];
  features: string[];
}

export interface ClusterEvaluation {
  k: number;
  inertia: number;
  silhouette_score: number;
  davies_bouldin_index: number;
}

export interface ClusterProfile {
  cluster_id: number;
  name: string;
  song_count: number;
  percentage: number;
  top_genre: string;
  genre_breakdown: Record<string, number>;
  audio_means: Record<string, number>;
  radar_features: Record<string, number>;
  representative_tracks: {
    track_id: string;
    track_name: string;
    track_artist: string;
    playlist_genre: string;
    playlist_subgenre: string;
    popularity: number;
    energy: number;
    danceability: number;
    distance: number;
  }[];
}

export interface PCAPoint {
  id: string;
  name: string;
  artist: string;
  genre: string;
  subgenre: string;
  popularity: number;
  cluster: number;
  x: number;
  y: number;
  energy: number;
  danceability: number;
  valence: number;
}

export interface PCAData {
  explained_variance: {
    pc1: number;
    pc2: number;
    total: number;
  };
  loadings: Record<string, { PC1: number; PC2: number }>;
  total_points: number;
  points: PCAPoint[];
  interpretation: {
    pc1_meaning: string;
    pc2_meaning: string;
  };
}

export interface CorrelationData {
  features: string[];
  matrix: Record<string, any>[];
  top_pairs: {
    feature_1: string;
    feature_2: string;
    correlation: number;
    strength: string;
    direction: string;
    explanation: string;
  }[];
  all_pairs: any[];
  summary: {
    strongest_positive?: any;
    strongest_negative?: any;
  };
}

export interface RecommendationItem {
  rank: number;
  track_id: string;
  track_name: string;
  track_artist: string;
  playlist_genre: string;
  playlist_subgenre: string;
  popularity: number;
  similarity_score: number;
  similarity_percentage: number;
  audio_features: Record<string, number>;
}

export interface RecommendationResponse {
  seed_song: {
    track_id: string;
    track_name: string;
    track_artist: string;
    playlist_genre: string;
    playlist_subgenre: string;
    popularity: number;
    audio_features: Record<string, number>;
  };
  recommendations: RecommendationItem[];
  total_found: number;
}

export interface MusicInsight {
  category: string;
  title: string;
  stat: string;
  badge: string;
  description: string;
}

export interface GenreDetail {
  genre: string;
  track_count: number;
  subgenres: string[];
  avg_popularity: number;
  audio_profile: Record<string, number>;
  cluster_composition: {
    cluster_id: number;
    count: number;
    percentage: number;
  }[];
}
