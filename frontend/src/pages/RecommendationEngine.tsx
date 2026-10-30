import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RecommendationItem, RecommendationResponse, Song } from '../types';
import {
  Sparkles,
  Search,
  Filter,
  Heart,
  BookmarkCheck,
  Disc,
  Flame,
  Activity,
  Sliders,
  CheckCircle,
  TrendingUp,
  Volume2
} from 'lucide-react';
import { AudioFeatureBar } from '../components/AudioFeatureBar';

interface RecommendationEngineProps {
  initialSeedSong?: Song | null;
  onSelectSong: (song: any) => void;
  onSaveFavorite?: (song: any) => void;
}

export const RecommendationEngine: React.FC<RecommendationEngineProps> = ({
  initialSeedSong,
  onSelectSong,
  onSaveFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [seedSong, setSeedSong] = useState<any | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Recommender Parameters
  const [nRecs, setNRecs] = useState<number>(10);
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [minPop, setMinPop] = useState<number>(0);
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});

  // Quick initial catalog search
  useEffect(() => {
    const loadDefaultSongs = async () => {
      try {
        const songs = await api.searchSongs('', 8);
        setSearchResults(songs);
        if (initialSeedSong) {
          setSeedSong(initialSeedSong);
          handleGenerateRecommendations(initialSeedSong.track_id);
        } else if (songs.length > 0) {
          setSeedSong(songs[0]);
          handleGenerateRecommendations(songs[0].track_id);
        }
      } catch (err) {
        console.error('Failed to load initial songs:', err);
      }
    };
    loadDefaultSongs();
  }, [initialSeedSong]);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    setIsSearching(true);
    try {
      const res = await api.searchSongs(q, 10);
      setSearchResults(res);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSeed = (song: any) => {
    setSeedSong(song);
    handleGenerateRecommendations(song.track_id);
  };

  const handleGenerateRecommendations = async (trackId?: string) => {
    const targetId = trackId || seedSong?.track_id;
    if (!targetId) return;

    try {
      setLoading(true);
      const res: RecommendationResponse = await api.getRecommendations({
        seed_track_id: targetId,
        n_recommendations: nRecs,
        filter_genre: genreFilter !== 'all' ? genreFilter : undefined,
        min_popularity: minPop,
      });
      setSeedSong(res.seed_song);
      setRecommendations(res.recommendations);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecommendation = async (rec: RecommendationItem) => {
    if (!seedSong) return;
    try {
      await api.saveRecommendation({
        seed_track_id: seedSong.track_id,
        seed_track_name: seedSong.track_name,
        seed_artist: seedSong.track_artist,
        recommended_track_id: rec.track_id,
        recommended_track_name: rec.track_name,
        recommended_artist: rec.track_artist,
        genre: rec.playlist_genre,
        similarity_score: rec.similarity_score,
      });
      setSavedStatus((prev) => ({ ...prev, [rec.track_id]: true }));
    } catch (err) {
      console.error('Failed to save recommendation:', err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Song Search Section */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" /> AI Content-Based Recommendation Engine
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Computes high-dimensional Cosine Similarity across standardized acoustic vectors
          </p>
        </div>

        {/* Search Bar Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Type song title or artist to select seed track..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Autocomplete / Suggested Seed Pills */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            {searchQuery ? 'Matching Catalog Songs:' : 'Select Seed Track from Popular Catalog:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {searchResults.map((song) => {
              const isSelected = seedSong?.track_id === song.track_id;
              return (
                <button
                  key={song.track_id}
                  onClick={() => handleSelectSeed(song)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition text-left flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-emerald-500 text-black font-semibold border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-gray-900/80 text-gray-300 hover:text-white border-white/5 hover:bg-gray-800'
                  }`}
                >
                  <Disc className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-emerald-400'}`} />
                  <span className="max-w-[160px] truncate">{song.track_name}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-gray-900' : 'text-gray-400'}`}>
                    • {song.track_artist}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Configuration Parameter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5 text-xs">
          {/* Recommendation Count */}
          <div>
            <label className="text-gray-400 block mb-1.5 font-medium">Recommendations Count:</label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    setNRecs(num);
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-mono font-medium border transition ${
                    nRecs === num
                      ? 'bg-emerald-500 text-black font-bold border-emerald-400'
                      : 'bg-gray-900 text-gray-400 border-white/5 hover:text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Genre Constrain Filter */}
          <div>
            <label className="text-gray-400 block mb-1.5 font-medium">Filter by Genre:</label>
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="w-full bg-gray-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Any Genre (Global Similarity)</option>
              {['edm', 'rap', 'pop', 'r&b', 'latin', 'rock'].map((g) => (
                <option key={g} value={g}>
                  {g.toUpperCase()} Only
                </option>
              ))}
            </select>
          </div>

          {/* Min Popularity Threshold */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-gray-400 font-medium">Min Popularity:</label>
              <span className="font-mono text-emerald-400 font-bold">{minPop}+</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="5"
              value={minPop}
              onChange={(e) => setMinPop(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => handleGenerateRecommendations()}
            disabled={loading || !seedSong}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-semibold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-black" />
            Recalculate Recommendations
          </button>
        </div>
      </div>

      {/* Selected Seed Song Display */}
      {seedSong && (
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-gray-900/60 to-gray-950/80">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Disc className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                  Current Target Seed Track
                </span>
                <h3 className="text-base font-bold text-white">{seedSong.track_name}</h3>
                <p className="text-xs text-gray-300">
                  {seedSong.track_artist} •{' '}
                  <span className="text-emerald-400 uppercase font-semibold">
                    {seedSong.playlist_genre}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <span className="text-gray-400 block text-[10px]">Danceability</span>
                <span className="font-bold text-white">
                  {Math.round((seedSong.audio_features?.danceability || seedSong.danceability || 0) * 100)}%
                </span>
              </div>
              <div className="text-right">
                <span className="text-gray-400 block text-[10px]">Energy</span>
                <span className="font-bold text-white">
                  {Math.round((seedSong.audio_features?.energy || seedSong.energy || 0) * 100)}%
                </span>
              </div>
              <div className="text-right">
                <span className="text-gray-400 block text-[10px]">Tempo</span>
                <span className="font-bold text-white">
                  {Math.round(seedSong.audio_features?.tempo || seedSong.tempo || 0)} BPM
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Results List */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-white">Recommended Similar Spotify Songs</h3>
            <p className="text-xs text-gray-400">
              Ranked by Cosine Similarity in standardized 10D audio feature space
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-gray-900 border border-white/5 text-gray-300">
            {recommendations.length} Results
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400 space-y-2">
            <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mx-auto" />
            <p className="text-xs">Computing cosine similarities across 32,833 tracks...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            No similar tracks found matching your constraint criteria. Try lowering the popularity threshold or relaxing genre filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {recommendations.map((rec) => {
              const isSaved = savedStatus[rec.track_id];
              return (
                <div
                  key={rec.track_id}
                  onClick={() => onSelectSong(rec)}
                  className="p-4 rounded-xl bg-gray-950/60 border border-white/5 hover:border-emerald-500/30 transition cursor-pointer group flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 max-w-sm">
                    <span className="w-6 text-center font-mono font-bold text-gray-500 group-hover:text-emerald-400 transition text-sm">
                      #{rec.rank}
                    </span>
                    <div>
                      <h4 className="font-semibold text-white group-hover:text-emerald-400 transition text-sm truncate max-w-[240px]">
                        {rec.track_name}
                      </h4>
                      <p className="text-xs text-gray-400 truncate max-w-[240px]">
                        {rec.track_artist}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-800 text-gray-300 uppercase">
                          {rec.playlist_genre}
                        </span>
                        <span className="text-[10px] text-gray-400">Pop: {rec.popularity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Audio Bars Preview */}
                  <div className="flex items-center gap-4 w-full md:w-64 text-xs">
                    <div className="w-1/2">
                      <AudioFeatureBar
                        label="Dance"
                        value={rec.audio_features.danceability}
                        color="from-green-500 to-emerald-400"
                      />
                    </div>
                    <div className="w-1/2">
                      <AudioFeatureBar
                        label="Energy"
                        value={rec.audio_features.energy}
                        color="from-amber-500 to-yellow-400"
                      />
                    </div>
                  </div>

                  {/* Match Percentage & Save Action */}
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block text-[10px]">Cosine Match</span>
                      <span className="text-base font-extrabold text-emerald-400 font-mono">
                        {rec.similarity_percentage}%
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveRecommendation(rec);
                      }}
                      className={`p-2 rounded-xl transition border text-xs flex items-center gap-1.5 ${
                        isSaved
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-gray-900 hover:bg-gray-800 text-gray-300 border-white/5 hover:text-white'
                      }`}
                      title="Save Recommendation"
                    >
                      <BookmarkCheck className={`w-4 h-4 ${isSaved ? 'text-emerald-400' : ''}`} />
                      <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
