import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ClusterProfile, ClusterEvaluation, Song } from '../types';
import {
  GitFork,
  CheckCircle2,
  PieChart as PieIcon,
  Activity,
  Sparkles,
  Info,
  Disc,
  ArrowRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const CLUSTER_COLORS = ['#10b981', '#38bdf8', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];

interface ClusteringProps {
  onSelectSong: (song: any) => void;
  onNavigateToRecommender: (song: any) => void;
}

export const Clustering: React.FC<ClusteringProps> = ({ onSelectSong, onNavigateToRecommender }) => {
  const [data, setData] = useState<{
    optimal_k: number;
    profiles: ClusterProfile[];
    evaluation: ClusterEvaluation[];
  } | null>(null);
  const [selectedClusterId, setSelectedClusterId] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        setLoading(true);
        const res = await api.getClusters();
        setData(res);
      } catch (err) {
        console.error('Failed to load clusters:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClusters();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Evaluating K-Means inertia and silhouette scores...</p>
      </div>
    );
  }

  if (!data) return null;

  const { optimal_k, profiles, evaluation } = data;
  const currentProfile = profiles.find((p) => p.cluster_id === selectedClusterId) || profiles[0];

  // Prepare radar data for selected cluster
  const radarData = Object.entries(currentProfile.radar_features).map(([feat, val]) => ({
    feature: feat.replace('_norm', ''),
    value: val,
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Model Overview & Evaluation Section */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <GitFork className="w-5 h-5 text-emerald-400" /> K-Means Model Evaluation & Optimal K
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Determining optimal cluster boundaries via WCSS Elbow Inertia and Silhouette metrics
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" /> Selected Model: k = {optimal_k} Clusters
          </div>
        </div>

        {/* Evaluation Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Elbow Curve */}
          <div className="p-4 rounded-xl bg-gray-950/60 border border-white/5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-white">Elbow Curve (Inertia / WCSS)</span>
              <span className="text-[10px] text-gray-400">Lower inertia = tighter clusters</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evaluation}>
                  <XAxis dataKey="k" stroke="#64748b" fontSize={11} tickLine={false} label={{ value: 'Clusters (k)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(val: any) => [Number(val).toLocaleString(), 'WCSS Inertia']}
                  />
                  <Line type="monotone" dataKey="inertia" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Silhouette Score */}
          <div className="p-4 rounded-xl bg-gray-950/60 border border-white/5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-white">Silhouette Score & Separation</span>
              <span className="text-[10px] text-gray-400">Higher score = clearer separation</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evaluation}>
                  <XAxis dataKey="k" stroke="#64748b" fontSize={11} tickLine={false} label={{ value: 'Clusters (k)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0.1, 0.2]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(val: any) => [val, 'Silhouette Score']}
                  />
                  <Line type="monotone" dataKey="silhouette_score" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4, fill: '#38bdf8' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Cluster Selection Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {profiles.map((p, idx) => (
          <button
            key={p.cluster_id}
            onClick={() => setSelectedClusterId(p.cluster_id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 border ${
              selectedClusterId === p.cluster_id
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'bg-gray-900/80 text-gray-400 hover:text-white border-white/5 hover:bg-gray-800'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: CLUSTER_COLORS[idx % CLUSTER_COLORS.length] }}
            />
            <span>Cluster #{p.cluster_id}</span>
            <span className="text-[10px] opacity-70">({p.percentage}%)</span>
          </button>
        ))}
      </div>

      {/* Selected Cluster Profile View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card & Info */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Cluster #{currentProfile.cluster_id} Archetype
            </span>
            <span className="text-xs text-gray-400 font-mono">
              {currentProfile.song_count.toLocaleString()} Songs ({currentProfile.percentage}%)
            </span>
          </div>

          <h3 className="text-xl font-bold text-white leading-tight">
            {currentProfile.name}
          </h3>

          <div className="p-3.5 rounded-xl bg-gray-950/60 border border-white/5 text-xs text-gray-300 leading-relaxed">
            <p className="font-semibold text-emerald-400 mb-1">Musical Profile:</p>
            Predominantly composed of <strong className="text-white uppercase">{currentProfile.top_genre}</strong> records. Features average danceability of <strong className="text-white">{Math.round((currentProfile.audio_means.danceability || 0) * 100)}%</strong>, energy of <strong className="text-white">{Math.round((currentProfile.audio_means.energy || 0) * 100)}%</strong>, and tempo pacing around <strong className="text-white">{Math.round(currentProfile.audio_means.tempo || 0)} BPM</strong>.
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-300 mb-2">Genre Composition Breakdown:</p>
            <div className="space-y-1.5">
              {Object.entries(currentProfile.genre_breakdown).map(([g, count]) => {
                const pct = Math.round(((count as number) / currentProfile.song_count) * 100);
                return (
                  <div key={g} className="text-xs">
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-gray-300 uppercase">{g}</span>
                      <span className="text-gray-400">{pct}% ({count})</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1 overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Acoustic Radar */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
          <h4 className="text-sm font-bold text-white mb-1">Cluster Acoustic Radar</h4>
          <p className="text-xs text-gray-400 mb-4">Centroid normalized dimensions</p>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="feature" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} stroke="#334155" />
                <Radar
                  name={currentProfile.name}
                  dataKey="value"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.45}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Representative Tracks (Centroid Exemplars) */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
          <div>
            <h4 className="text-sm font-bold text-white">Exemplar Centroid Tracks</h4>
            <p className="text-xs text-gray-400">Closest songs to this cluster's centroid vector</p>
          </div>

          <div className="space-y-2">
            {currentProfile.representative_tracks.map((track) => (
              <div
                key={track.track_id}
                onClick={() => onSelectSong(track)}
                className="p-2.5 rounded-xl bg-gray-950/60 border border-white/5 hover:border-emerald-500/30 transition cursor-pointer group flex items-center justify-between"
              >
                <div className="max-w-[170px] truncate">
                  <p className="text-xs font-semibold text-white group-hover:text-emerald-400 transition truncate">
                    {track.track_name}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">{track.track_artist}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-emerald-400">
                    d={track.distance}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToRecommender(track);
                    }}
                    className="block mt-1 text-[10px] text-emerald-400 hover:underline"
                  >
                    Similar →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
