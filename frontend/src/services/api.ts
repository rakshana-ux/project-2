import axios from 'axios';
import {
  DashboardData,
  PreprocessingReport,
  CorrelationData,
  PCAData,
  RecommendationResponse,
  MusicInsight,
  GenreDetail,
  ClusterProfile,
  ClusterEvaluation
} from '../types';

const API_BASE = '/api';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export const api = {
  // Dashboard
  getDashboard: async (): Promise<DashboardData> => {
    const res = await client.get('/dashboard');
    return res.data;
  },

  // Preprocessing Report
  getPreprocessing: async (): Promise<PreprocessingReport> => {
    const res = await client.get('/preprocessing');
    return res.data;
  },

  // Dataset Explorer
  getDataset: async (params: {
    page?: number;
    page_size?: number;
    search?: string;
    genre?: string;
    subgenre?: string;
    min_popularity?: number;
    sort_by?: string;
    sort_order?: string;
  }) => {
    const res = await client.get('/dataset', { params });
    return res.data;
  },

  // Genres Segmentation
  getGenres: async (): Promise<{ genres: GenreDetail[]; total_genres: number }> => {
    const res = await client.get('/genres');
    return res.data;
  },

  // Analytics & EDA
  getAnalytics: async () => {
    const res = await client.get('/analytics');
    return res.data;
  },

  // Correlation Matrix
  getCorrelation: async (): Promise<CorrelationData> => {
    const res = await client.get('/correlation');
    return res.data;
  },

  // Clustering
  getClusters: async (): Promise<{
    optimal_k: number;
    profiles: ClusterProfile[];
    evaluation: ClusterEvaluation[];
  }> => {
    const res = await client.get('/clusters');
    return res.data;
  },

  getClusterEvaluation: async (): Promise<{
    evaluation: ClusterEvaluation[];
    optimal_k: number;
    explanation: string;
  }> => {
    const res = await client.get('/clusters/evaluation');
    return res.data;
  },

  // PCA Visualization
  getPCA: async (): Promise<PCAData> => {
    const res = await client.get('/pca');
    return res.data;
  },

  // AI Recommendations
  getRecommendations: async (payload: {
    seed_track_id: string;
    n_recommendations?: number;
    filter_genre?: string;
    min_popularity?: number;
  }): Promise<RecommendationResponse> => {
    const res = await client.post('/recommend', payload);
    return res.data;
  },

  // Song Search Autocomplete
  searchSongs: async (q: string, limit: number = 15) => {
    const res = await client.get('/songs/search', { params: { q, limit } });
    return res.data;
  },

  // Dynamic Insights
  getInsights: async (): Promise<{ insights: MusicInsight[] }> => {
    const res = await client.get('/insights');
    return res.data;
  },

  // Favorites
  getFavorites: async () => {
    const res = await client.get('/favorites');
    return res.data.favorites;
  },

  addFavorite: async (song: any) => {
    const res = await client.post('/favorites', song);
    return res.data;
  },

  removeFavorite: async (trackId: string) => {
    const res = await client.delete(`/favorites/${trackId}`);
    return res.data;
  },

  // Saved Recommendations
  getSavedRecommendations: async () => {
    const res = await client.get('/recommendations/saved');
    return res.data.saved;
  },

  saveRecommendation: async (payload: any) => {
    const res = await client.post('/recommendations/saved', payload);
    return res.data;
  },

  deleteSavedRecommendation: async (id: number) => {
    const res = await client.delete(`/recommendations/saved/${id}`);
    return res.data;
  }
};
