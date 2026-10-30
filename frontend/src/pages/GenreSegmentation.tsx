import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { GenreDetail } from '../types';
import {
  Disc3,
  Flame,
  Activity,
  Gauge,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Volume2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const GENRE_COLORS: Record<string, string> = {
  EDM: '#10b981',
  RAP: '#f59e0b',
  POP: '#ec4899',
  'R&B': '#8b5cf6',
  LATIN: '#06b6d4',
  ROCK: '#ef4444',
};

const CLUSTER_NAMES: Record<number, string> = {
  0: 'Atmospheric & Chill Vibes',
  1: 'High-Octane EDM & Festival Beats',
  2: 'Groovy R&B & Urban Melodies',
  3: 'Aggressive Rap & Fast Flow',
  4: 'Acoustic Warmth & Folk Intimacy',
  5: 'Heavy Rock & High-Loudness Drives',
};

export const GenreSegmentation: React.FC = () => {
  const [genres, setGenres] = useState<GenreDetail[]>([]);
  const [selectedGenreName, setSelectedGenreName] = useState<string>('EDM');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        const res = await api.getGenres();
        setGenres(res.genres);
        if (res.genres.length > 0) {
          setSelectedGenreName(res.genres[0].genre);
        }
      } catch (err) {
        console.error('Failed to load genres:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGenres();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Cross-segmenting the 6 foundational Spotify genres...</p>
      </div>
    );
  }

  const selectedGenre =
    genres.find((g) => g.genre === selectedGenreName) || genres[0];

  const radarData = selectedGenre
    ? [
        { subject: 'Danceability', value: selectedGenre.audio_profile.danceability },
        { subject: 'Energy', value: selectedGenre.audio_profile.energy },
        { subject: 'Valence', value: selectedGenre.audio_profile.valence },
        { subject: 'Acousticness', value: selectedGenre.audio_profile.acousticness },
        { subject: 'Speechiness', value: selectedGenre.audio_profile.speechiness },
        { subject: 'Instrumental', value: selectedGenre.audio_profile.instrumentalness },
      ]
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Genre Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {genres.map((g) => {
          const isSelected = selectedGenreName === g.genre;
          const color = GENRE_COLORS[g.genre] || '#10b981';
          return (
            <button
              key={g.genre}
              onClick={() => setSelectedGenreName(g.genre)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-gray-900 border-white/20 shadow-xl scale-102 ring-1'
                  : 'bg-gray-950/60 border-white/5 hover:border-white/10 hover:bg-gray-900/40'
              }`}
              style={{
                borderColor: isSelected ? color : undefined,
                boxShadow: isSelected ? `0 10px 25px -5px ${color}30` : undefined,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[10px] font-mono text-gray-400">
                  {g.track_count.toLocaleString()} tracks
                </span>
              </div>
              <h4 className="text-base font-bold text-white uppercase">{g.genre}</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Pop: <strong className="text-white">{g.avg_popularity}</strong>
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Genre In-Depth Profile */}
      {selectedGenre && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Audio Profile & Subgenres */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 lg:col-span-1">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase"
                  style={{
                    backgroundColor: `${GENRE_COLORS[selectedGenre.genre]}25`,
                    color: GENRE_COLORS[selectedGenre.genre],
                    border: `1px solid ${GENRE_COLORS[selectedGenre.genre]}40`,
                  }}
                >
                  {selectedGenre.genre}
                </span>
                <span className="text-xs text-gray-400">
                  {selectedGenre.track_count.toLocaleString()} Songs
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">Genre Audio Profile</h3>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-gray-950/60 border border-white/5">
                <span className="text-gray-400 block mb-0.5 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" /> Avg Energy
                </span>
                <span className="text-base font-bold text-white">
                  {Math.round(selectedGenre.audio_profile.energy * 100)}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-gray-950/60 border border-white/5">
                <span className="text-gray-400 block mb-0.5 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-green-400" /> Avg Danceability
                </span>
                <span className="text-base font-bold text-white">
                  {Math.round(selectedGenre.audio_profile.danceability * 100)}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-gray-950/60 border border-white/5">
                <span className="text-gray-400 block mb-0.5 flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-cyan-400" /> Avg Tempo
                </span>
                <span className="text-base font-bold text-white">
                  {Math.round(selectedGenre.audio_profile.tempo)} BPM
                </span>
              </div>
              <div className="p-3 rounded-xl bg-gray-950/60 border border-white/5">
                <span className="text-gray-400 block mb-0.5 flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-purple-400" /> Avg Loudness
                </span>
                <span className="text-base font-bold text-white">
                  {selectedGenre.audio_profile.loudness} dB
                </span>
              </div>
            </div>

            {/* Subgenres List */}
            <div>
              <p className="text-xs font-semibold text-gray-300 mb-2">Stylistic Subgenres:</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedGenre.subgenres.map((sub) => (
                  <span
                    key={sub}
                    className="px-2.5 py-1 rounded-lg text-xs bg-gray-950/60 text-gray-300 border border-white/5 capitalize"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center lg:col-span-1">
            <h4 className="text-sm font-bold text-white mb-1">Acoustic Radar Signature</h4>
            <p className="text-xs text-gray-400 mb-4">Polygon balance across 6 acoustic dimensions</p>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} stroke="#334155" />
                  <Radar
                    name={selectedGenre.genre}
                    dataKey="value"
                    stroke={GENRE_COLORS[selectedGenre.genre] || '#10b981'}
                    fill={GENRE_COLORS[selectedGenre.genre] || '#10b981'}
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cluster Composition in this Genre */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3 lg:col-span-1">
            <div>
              <h4 className="text-sm font-bold text-white">Discovered Cluster Composition</h4>
              <p className="text-xs text-gray-400">
                How unsupervised ML clusters partition this genre's catalog
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {selectedGenre.cluster_composition.map((comp) => (
                <div key={comp.cluster_id} className="text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-white">
                      Cluster #{comp.cluster_id}: {CLUSTER_NAMES[comp.cluster_id] || 'Profile'}
                    </span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {comp.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full"
                      style={{ width: `${comp.percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 mt-0.5 block">
                    {comp.count.toLocaleString()} tracks classified
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comparative Multi-Genre Benchmarks */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5">
        <h3 className="text-base font-bold text-white mb-1">
          Comparative Genre Audio Benchmark (Energy vs Danceability vs Valence)
        </h3>
        <p className="text-xs text-gray-400 mb-6">
          Comparing average audio metrics simultaneously across the 6 major genre categories
        </p>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={genres.map((g) => ({
                genre: g.genre,
                Danceability: g.audio_profile.danceability,
                Energy: g.audio_profile.energy,
                Valence: g.audio_profile.valence,
                Acousticness: g.audio_profile.acousticness,
              }))}
            >
              <XAxis dataKey="genre" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 1]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Danceability" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Energy" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Valence" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Acousticness" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
