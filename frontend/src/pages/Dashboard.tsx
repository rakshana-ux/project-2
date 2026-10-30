import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardData, TopSong } from '../types';
import {
  Music,
  Users,
  Disc,
  FolderGit2,
  TrendingUp,
  Activity,
  Flame,
  Gauge,
  Sparkles,
  ArrowUpRight,
  Radio
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';

const GENRE_COLORS: Record<string, string> = {
  EDM: '#10b981',
  RAP: '#f59e0b',
  POP: '#ec4899',
  'R&B': '#8b5cf6',
  LATIN: '#06b6d4',
  ROCK: '#ef4444',
};

interface DashboardProps {
  onSelectSong: (song: any) => void;
  onNavigateToRecommender: (song: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectSong, onNavigateToRecommender }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.getDashboard();
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Aggregating Spotify dataset analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
        <p className="font-semibold">Error Loading Dashboard</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const { metrics, genre_distribution, top_10_songs, top_10_artists, radar_overview } = data;

  const kpis = [
    { label: 'Total Songs', value: metrics.total_songs.toLocaleString(), icon: Music, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Total Artists', value: metrics.total_artists.toLocaleString(), icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Main Genres', value: metrics.total_genres, icon: Disc, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Subgenres', value: metrics.total_subgenres, icon: FolderGit2, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: 'Avg Popularity', value: `${metrics.avg_popularity}/100`, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Avg Danceability', value: metrics.avg_danceability, icon: Activity, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Avg Energy', value: metrics.avg_energy, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Avg Tempo', value: `${metrics.avg_tempo} BPM`, icon: Gauge, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-emerald-950/60 via-gray-900/80 to-gray-900/90 border border-emerald-500/20 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" /> Live Analytical Telemetry
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Spotify Music Intelligence & Recommendation Engine
          </h1>
          <p className="text-gray-300 text-sm leading-relaxed">
            Harnessing unsupervised machine learning (K-Means Clustering), Principal Component Analysis, and vector cosine similarity across 32,833 authentic Spotify tracks.
          </p>
        </div>
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-white/10 transition group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-400">{kpi.label}</span>
                <div className={`p-2 rounded-xl ${kpi.bg}`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white tracking-tight group-hover:text-emerald-400 transition">
                {kpi.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Genre Distribution Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Genre Distribution & Song Counts</h3>
              <p className="text-xs text-gray-400">Total track volume categorized across the 6 major Spotify genres</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-300 border border-white/5">
              32,833 Tracks
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genre_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="genre" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`${Number(val).toLocaleString()} songs`, 'Catalog Count']}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {genre_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GENRE_COLORS[entry.genre] || '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Radar Overview */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Audio Feature Signature</h3>
            <p className="text-xs text-gray-400">Dataset averages vs. global pop benchmark</p>
          </div>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar_overview}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="feature" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} stroke="#334155" />
                <Radar name="Catalog Average" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Radar name="Benchmark" dataKey="benchmark" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.15} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Genre Comparison & Top Artists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre Popularity & Energy */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <h3 className="text-base font-bold text-white mb-1">Genre Popularity vs Energy</h3>
          <p className="text-xs text-gray-400 mb-6">Cross-comparison of average commercial popularity and acoustic energy</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genre_distribution}>
                <XAxis dataKey="genre" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="avg_popularity" name="Avg Popularity (/100)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 Artists */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <h3 className="text-base font-bold text-white mb-1">Top 10 Prolific Artists</h3>
          <p className="text-xs text-gray-400 mb-6">Artists with the highest track representation in the catalog</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={top_10_artists} margin={{ left: 35, right: 20 }}>
                <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis dataKey="artist" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="track_count" name="Track Count" fill="#38bdf8" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top 10 Popular Songs Table */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Top 10 Most Popular Spotify Songs</h3>
            <p className="text-xs text-gray-400">Highest ranked commercial tracks in the 32k+ database</p>
          </div>
          <span className="text-xs text-emerald-400 font-medium">Sorted by Popularity Score</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400">
                <th className="pb-3 font-semibold">#</th>
                <th className="pb-3 font-semibold">Track Title</th>
                <th className="pb-3 font-semibold">Artist</th>
                <th className="pb-3 font-semibold">Genre</th>
                <th className="pb-3 font-semibold">Subgenre</th>
                <th className="pb-3 font-semibold">Popularity</th>
                <th className="pb-3 font-semibold">Danceability</th>
                <th className="pb-3 font-semibold">Energy</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {top_10_songs.map((song, idx) => (
                <tr
                  key={song.track_id}
                  className="hover:bg-white/5 transition group cursor-pointer"
                  onClick={() => onSelectSong(song)}
                >
                  <td className="py-3.5 text-gray-400 font-mono">{idx + 1}</td>
                  <td className="py-3.5 font-medium text-white group-hover:text-emerald-400 transition max-w-[200px] truncate">
                    {song.track_name}
                  </td>
                  <td className="py-3.5 text-gray-300">{song.artist}</td>
                  <td className="py-3.5">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${GENRE_COLORS[song.genre] || '#10b981'}20`,
                        color: GENRE_COLORS[song.genre] || '#10b981',
                        border: `1px solid ${GENRE_COLORS[song.genre] || '#10b981'}40`,
                      }}
                    >
                      {song.genre}
                    </span>
                  </td>
                  <td className="py-3.5 text-gray-400">{song.subgenre}</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{song.popularity}</span>
                      <div className="w-12 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full"
                          style={{ width: `${song.popularity}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 text-gray-300">{Math.round(song.danceability * 100)}%</td>
                  <td className="py-3.5 text-gray-300">{Math.round(song.energy * 100)}%</td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToRecommender(song);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium transition inline-flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Similar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
