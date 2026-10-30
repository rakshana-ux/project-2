import React from 'react';
import { X, Sparkles, Heart, Activity, Disc, Zap, Volume2, Music } from 'lucide-react';
import { Song } from '../types';
import { AudioFeatureBar } from './AudioFeatureBar';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface SongDetailModalProps {
  song: Song | null;
  onClose: () => void;
  onRecommendSimilar: (song: Song) => void;
  onToggleFavorite?: (song: Song) => void;
  isFavorite?: boolean;
}

export const SongDetailModal: React.FC<SongDetailModalProps> = ({
  song,
  onClose,
  onRecommendSimilar,
  onToggleFavorite,
  isFavorite = false,
}) => {
  if (!song) return null;

  const radarData = [
    { subject: 'Danceability', value: song.danceability },
    { subject: 'Energy', value: song.energy },
    { subject: 'Valence', value: song.valence },
    { subject: 'Acousticness', value: song.acousticness },
    { subject: 'Speechiness', value: song.speechiness },
    { subject: 'Liveness', value: (song as any).liveness ?? 0.2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gray-900/95 border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden">
        {/* Background Accent Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Disc className="w-7 h-7 text-black animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">{song.track_name}</h2>
              <p className="text-emerald-400 font-medium text-sm">{song.track_artist}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {song.playlist_genre}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-800 text-gray-300 border border-white/5">
                  {song.playlist_subgenre}
                </span>
                <span className="text-xs text-gray-400">
                  Pop: <strong className="text-gray-200">{song.popularity}</strong>/100
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Radar Chart */}
          <div className="h-64 bg-gray-950/60 rounded-xl p-2 border border-white/5 flex flex-col items-center justify-center">
            <p className="text-xs font-medium text-gray-400 mb-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Acoustic Signature Radar
            </p>
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} stroke="#334155" />
                  <Radar
                    name="Audio Profile"
                    dataKey="value"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.45}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Audio Bars & Stats */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="p-2.5 rounded-lg bg-gray-800/50 border border-white/5">
                <span className="text-gray-400 block mb-0.5 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Tempo
                </span>
                <span className="text-sm font-semibold text-white">{Math.round(song.tempo)} BPM</span>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-800/50 border border-white/5">
                <span className="text-gray-400 block mb-0.5 flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-cyan-400" /> Loudness
                </span>
                <span className="text-sm font-semibold text-white">{song.loudness} dB</span>
              </div>
            </div>

            <AudioFeatureBar label="Danceability" value={song.danceability} color="from-green-500 to-emerald-400" />
            <AudioFeatureBar label="Energy" value={song.energy} color="from-amber-500 to-yellow-400" />
            <AudioFeatureBar label="Valence (Positivity)" value={song.valence} color="from-cyan-500 to-blue-400" />
            <AudioFeatureBar label="Acousticness" value={song.acousticness} color="from-purple-500 to-pink-400" />
            <AudioFeatureBar label="Speechiness" value={song.speechiness} color="from-rose-500 to-red-400" />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(song)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition border ${
                isFavorite
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-white/10'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-400 text-rose-400' : ''}`} />
              {isFavorite ? 'Saved in Favorites' : 'Add to Favorites'}
            </button>
          )}

          <button
            onClick={() => {
              onRecommendSimilar(song);
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition ml-auto"
          >
            <Sparkles className="w-4 h-4 text-black" />
            Generate Similar Recommendations
          </button>
        </div>
      </div>
    </div>
  );
};
