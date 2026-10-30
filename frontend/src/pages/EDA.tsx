import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { BarChart3, Sliders, Layers, TrendingUp, Music } from 'lucide-react';

export const EDA: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState('danceability');

  useEffect(() => {
    const fetchEDA = async () => {
      try {
        setLoading(true);
        const res = await api.getAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load EDA:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEDA();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Computing exploratory feature distributions...</p>
      </div>
    );
  }

  if (!data) return null;

  const { distributions, genre_comparisons, subgenres, top_artists, top_playlists } = data;

  const featureTabs = [
    { id: 'danceability', label: 'Danceability', color: '#10b981' },
    { id: 'energy', label: 'Energy', color: '#f59e0b' },
    { id: 'track_popularity', label: 'Popularity', color: '#ec4899' },
    { id: 'tempo', label: 'Tempo (BPM)', color: '#38bdf8' },
    { id: 'loudness', label: 'Loudness (dB)', color: '#a855f7' },
    { id: 'valence', label: 'Valence', color: '#14b8a6' },
    { id: 'acousticness', label: 'Acousticness', color: '#eab308' },
    { id: 'speechiness', label: 'Speechiness', color: '#f43f5e' },
    { id: 'instrumentalness', label: 'Instrumentalness', color: '#6366f1' },
  ];

  const currentDist = distributions[selectedFeature] || [];
  const activeColor = featureTabs.find((f) => f.id === selectedFeature)?.color || '#10b981';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Feature Distribution Interactive Explorer */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" /> Continuous Audio Feature Distribution
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Histogram bins calculated over all 32k+ songs to analyze skewness and density
            </p>
          </div>

          {/* Feature Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {featureTabs.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFeature(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedFeature === f.id
                    ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-gray-900/80 text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Histogram Chart */}
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="distGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={activeColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="bin" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val: any) => [`${Number(val).toLocaleString()} songs`, 'Frequency']}
              />
              <Area type="monotone" dataKey="count" stroke={activeColor} strokeWidth={2} fill="url(#distGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Genre Comparative Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre vs Danceability & Energy */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <h3 className="text-base font-bold text-white mb-1">Genre vs Danceability & Energy</h3>
          <p className="text-xs text-gray-400 mb-6">Contrasting rhythmic motion against acoustic drive</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genre_comparisons}>
                <XAxis dataKey="genre" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 1]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="avg_danceability" name="Danceability" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avg_energy" name="Energy" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Genre vs Popularity & Tempo */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <h3 className="text-base font-bold text-white mb-1">Genre vs Average Tempo (BPM)</h3>
          <p className="text-xs text-gray-400 mb-6">Pacing benchmarks across the six foundational music genres</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genre_comparisons}>
                <XAxis dataKey="genre" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[90, 140]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} BPM`, 'Tempo']}
                />
                <Bar dataKey="avg_tempo" name="Avg Tempo (BPM)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subgenre Exploration Table */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-bold text-white">24 Subgenre Detailed Breakdown</h3>
            <p className="text-xs text-gray-400">Granular stylistic subcategories across the catalog</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-emerald-400 border border-white/5 font-mono">
            24 Subgenres
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400">
                <th className="pb-3 font-semibold">Subgenre</th>
                <th className="pb-3 font-semibold">Parent Genre</th>
                <th className="pb-3 font-semibold">Track Count</th>
                <th className="pb-3 font-semibold">Avg Popularity</th>
                <th className="pb-3 font-semibold">Avg Energy</th>
                <th className="pb-3 font-semibold">Avg Danceability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {subgenres.map((sub: any) => (
                <tr key={sub.subgenre} className="hover:bg-white/5 transition">
                  <td className="py-3 font-medium text-white capitalize">{sub.subgenre}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-800 text-gray-300 border border-white/5">
                      {sub.genre}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-gray-300">{sub.count.toLocaleString()}</td>
                  <td className="py-3 font-mono text-amber-400">{sub.avg_popularity}</td>
                  <td className="py-3 font-mono text-emerald-400">{Math.round(sub.avg_energy * 100)}%</td>
                  <td className="py-3 font-mono text-cyan-400">{Math.round(sub.avg_danceability * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Artists & Playlists Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 15 Artists */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <h3 className="text-base font-bold text-white mb-1">Top 15 Represented Artists</h3>
          <p className="text-xs text-gray-400 mb-6">Volume of tracks and their associated genre identity</p>
          <div className="space-y-3">
            {top_artists.map((art: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-950/40 border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-gray-400 w-4">{idx + 1}</span>
                  <div>
                    <p className="font-medium text-white">{art.artist}</p>
                    <span className="text-[10px] text-emerald-400">{art.primary_genre}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-semibold text-white">{art.count} songs</span>
                  <p className="text-[10px] text-gray-400">Avg Pop: {art.avg_popularity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 12 Playlists */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <h3 className="text-base font-bold text-white mb-1">Playlist-Wise Song Distribution</h3>
          <p className="text-xs text-gray-400 mb-6">Major Spotify playlists contributing to catalog diversity</p>
          <div className="space-y-3">
            {top_playlists.map((pl: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-gray-950/40 border border-white/5">
                <div className="max-w-[260px] truncate">
                  <p className="font-medium text-white truncate">{pl.playlist_name}</p>
                  <span className="text-[10px] text-gray-400">{pl.genre}</span>
                </div>
                <span className="font-mono text-emerald-400 font-semibold">{pl.count} tracks</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
