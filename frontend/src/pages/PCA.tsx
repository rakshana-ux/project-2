import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { PCAData, PCAPoint } from '../types';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import {
  Sparkles,
  Filter,
  Eye,
  SlidersHorizontal,
  Compass,
  Layers,
  Info
} from 'lucide-react';

const CLUSTER_COLORS = ['#10b981', '#38bdf8', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];
const GENRE_COLORS: Record<string, string> = {
  EDM: '#10b981',
  RAP: '#f59e0b',
  POP: '#ec4899',
  'R&B': '#8b5cf6',
  LATIN: '#06b6d4',
  ROCK: '#ef4444',
};

interface PCAPageProps {
  onSelectSong: (song: any) => void;
  onNavigateToRecommender: (song: any) => void;
}

export const PCAPage: React.FC<PCAPageProps> = ({ onSelectSong, onNavigateToRecommender }) => {
  const [data, setData] = useState<PCAData | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & display mode
  const [colorMode, setColorMode] = useState<'cluster' | 'genre'>('cluster');
  const [filterCluster, setFilterCluster] = useState<string>('all');
  const [filterGenre, setFilterGenre] = useState<string>('all');
  const [hoveredPoint, setHoveredPoint] = useState<PCAPoint | null>(null);

  useEffect(() => {
    const fetchPCA = async () => {
      try {
        setLoading(true);
        const res = await api.getPCA();
        setData(res);
      } catch (err) {
        console.error('Failed to load PCA data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPCA();
  }, []);

  const filteredPoints = useMemo(() => {
    if (!data) return [];
    return data.points.filter((pt) => {
      const matchCluster =
        filterCluster === 'all' || pt.cluster === parseInt(filterCluster, 10);
      const matchGenre =
        filterGenre === 'all' || pt.genre.toLowerCase() === filterGenre.toLowerCase();
      return matchCluster && matchGenre;
    });
  }, [data, filterCluster, filterGenre]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Projecting 10D audio attributes into 2D PCA latent coordinates...</p>
      </div>
    );
  }

  if (!data) return null;

  const { explained_variance, loadings, interpretation, total_points } = data;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const pt: PCAPoint = payload[0].payload;
      return (
        <div className="p-3 bg-gray-950/95 border border-white/10 rounded-xl shadow-2xl text-xs backdrop-blur-md max-w-xs">
          <p className="font-bold text-white leading-tight">{pt.name}</p>
          <p className="text-emerald-400 font-medium text-[11px] mb-2">{pt.artist}</p>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-800 text-gray-200">
              {pt.genre}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300">
              Cluster #{pt.cluster}
            </span>
            <span className="text-[10px] text-gray-400">Pop: {pt.popularity}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-gray-300 font-mono">
            <span>PC1: {pt.x}</span>
            <span>PC2: {pt.y}</span>
            <span>Energy: {Math.round(pt.energy * 100)}%</span>
            <span>Dance: {Math.round(pt.danceability * 100)}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Dimensionality Reduction Explainer Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <span className="text-xs text-gray-400 block mb-1">PC1 Explained Variance</span>
          <p className="text-2xl font-bold text-emerald-400 font-mono">
            {explained_variance.pc1}%
          </p>
          <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
            {interpretation.pc1_meaning}
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <span className="text-xs text-gray-400 block mb-1">PC2 Explained Variance</span>
          <p className="text-2xl font-bold text-cyan-400 font-mono">
            {explained_variance.pc2}%
          </p>
          <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
            {interpretation.pc2_meaning}
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/20">
          <span className="text-xs text-gray-400 block mb-1">Total Latent 2D Coverage</span>
          <p className="text-2xl font-bold text-white font-mono">
            {explained_variance.total}%
          </p>
          <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
            Preserves dominant acoustic variation while projecting 32,833 high-dimensional records into 2D space.
          </p>
        </div>
      </div>

      {/* Main 2D Scatter Chart Card */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
        {/* Controls Toolbar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-white/5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" /> Latent Audio Space 2D Scatter Projection
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Displaying {filteredPoints.length.toLocaleString()} sampled catalog tracks. Hover over points to inspect songs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Color Mode Switch */}
            <div className="flex items-center gap-1 bg-gray-900/80 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setColorMode('cluster')}
                className={`px-3 py-1 rounded-lg transition font-medium ${
                  colorMode === 'cluster'
                    ? 'bg-emerald-500 text-black font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Color by Cluster
              </button>
              <button
                onClick={() => setColorMode('genre')}
                className={`px-3 py-1 rounded-lg transition font-medium ${
                  colorMode === 'genre'
                    ? 'bg-emerald-500 text-black font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Color by Genre
              </button>
            </div>

            {/* Filter by Cluster */}
            <select
              value={filterCluster}
              onChange={(e) => setFilterCluster(e.target.value)}
              className="bg-gray-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Clusters</option>
              {[0, 1, 2, 3, 4, 5].map((c) => (
                <option key={c} value={c}>
                  Cluster #{c}
                </option>
              ))}
            </select>

            {/* Filter by Genre */}
            <select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="bg-gray-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Genres</option>
              {['edm', 'rap', 'pop', 'r&b', 'latin', 'rock'].map((g) => (
                <option key={g} value={g}>
                  {g.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2D Scatter Canvas */}
        <div className="h-[460px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
              <XAxis
                type="number"
                dataKey="x"
                name="Principal Component 1"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Principal Component 2"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <ZAxis range={[25, 25]} />
              <Tooltip content={<CustomTooltip />} />
              <Scatter
                name="Spotify Tracks"
                data={filteredPoints}
                onClick={(pt: any) => onSelectSong(pt)}
                cursor="pointer"
              >
                {filteredPoints.map((entry, index) => {
                  const color =
                    colorMode === 'cluster'
                      ? CLUSTER_COLORS[entry.cluster % CLUSTER_COLORS.length]
                      : GENRE_COLORS[entry.genre] || '#10b981';
                  return <Cell key={`cell-${index}`} fill={color} fillOpacity={0.7} />;
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature Loadings (Weights) on PC1 and PC2 */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5">
        <h3 className="text-base font-bold text-white mb-1">PCA Component Eigenvector Loadings</h3>
        <p className="text-xs text-gray-400 mb-6">
          Quantifying the contribution of each original audio feature to PC1 and PC2
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {Object.entries(loadings).map(([feat, loads]) => (
            <div key={feat} className="p-3 rounded-xl bg-gray-950/60 border border-white/5 text-xs">
              <span className="font-semibold text-white capitalize block mb-2">{feat}</span>
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-gray-400">PC1:</span>
                <span
                  className={`font-mono font-medium ${
                    loads.PC1 > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {loads.PC1 > 0 ? `+${loads.PC1}` : loads.PC1}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-gray-400">PC2:</span>
                <span
                  className={`font-mono font-medium ${
                    loads.PC2 > 0 ? 'text-cyan-400' : 'text-amber-400'
                  }`}
                >
                  {loads.PC2 > 0 ? `+${loads.PC2}` : loads.PC2}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
