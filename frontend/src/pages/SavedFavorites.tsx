import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Song } from '../types';
import { Heart, Trash2, Sparkles, Disc, ExternalLink, BookmarkCheck } from 'lucide-react';

interface SavedFavoritesProps {
  onSelectSong: (song: any) => void;
  onNavigateToRecommender: (song: any) => void;
  onUpdateFavoritesCount: (count: number) => void;
}

export const SavedFavorites: React.FC<SavedFavoritesProps> = ({
  onSelectSong,
  onNavigateToRecommender,
  onUpdateFavoritesCount,
}) => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [savedRecs, setSavedRecs] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'favorites' | 'recommendations'>('favorites');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [favs, recs] = await Promise.all([
        api.getFavorites(),
        api.getSavedRecommendations(),
      ]);
      setFavorites(favs);
      setSavedRecs(recs);
      onUpdateFavoritesCount(favs.length);
    } catch (err) {
      console.error('Failed to load saved items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRemoveFavorite = async (trackId: string) => {
    try {
      await api.removeFavorite(trackId);
      const updated = favorites.filter((f) => f.track_id !== trackId);
      setFavorites(updated);
      onUpdateFavoritesCount(updated.length);
    } catch (err) {
      console.error('Failed to delete favorite:', err);
    }
  };

  const handleDeleteSavedRec = async (id: number) => {
    try {
      await api.deleteSavedRecommendation(id);
      setSavedRecs((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete recommendation:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading your local SQLite bookmarks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Subtab Toggle Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveSubTab('favorites')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition border ${
            activeSubTab === 'favorites'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
              : 'bg-gray-900/80 text-gray-400 border-white/5 hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${activeSubTab === 'favorites' ? 'fill-emerald-400' : ''}`} />
          <span>Favorite Tracks ({favorites.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('recommendations')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition border ${
            activeSubTab === 'recommendations'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
              : 'bg-gray-900/80 text-gray-400 border-white/5 hover:text-white'
          }`}
        >
          <BookmarkCheck className="w-4 h-4 text-emerald-400" />
          <span>Saved AI Recommendations ({savedRecs.length})</span>
        </button>
      </div>

      {/* Subtab 1: Favorites */}
      {activeSubTab === 'favorites' && (
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-base font-bold text-white">Your Bookmarked Favorite Tracks</h3>
              <p className="text-xs text-gray-400">Stored persistently in SQLite for offline access</p>
            </div>
          </div>

          {favorites.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-xs">
              <Heart className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              You haven't added any favorite tracks yet. Click on any song in the Dataset Explorer to add it to your favorites.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favorites.map((song) => (
                <div
                  key={song.track_id}
                  onClick={() => onSelectSong(song)}
                  className="p-4 rounded-xl bg-gray-950/60 border border-white/5 hover:border-emerald-500/30 transition cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-emerald-400">
                      <Disc className="w-5 h-5" />
                    </div>
                    <div className="max-w-[200px] truncate">
                      <h4 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition truncate">
                        {song.track_name}
                      </h4>
                      <p className="text-xs text-gray-400 truncate">{song.track_artist}</p>
                      <span className="text-[10px] text-emerald-400 uppercase font-semibold">
                        {song.playlist_genre}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToRecommender(song);
                      }}
                      className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition text-xs flex items-center gap-1"
                      title="Find Similar Songs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(song.track_id);
                      }}
                      className="p-2 rounded-lg bg-gray-900 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subtab 2: Saved AI Recommendations */}
      {activeSubTab === 'recommendations' && (
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-base font-bold text-white">Saved AI Recommendation Matches</h3>
              <p className="text-xs text-gray-400">Pairwise similarity matches captured during listening sessions</p>
            </div>
          </div>

          {savedRecs.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-xs">
              <BookmarkCheck className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              No recommendation pairs saved yet. Use the AI Recommender to find and save songs!
            </div>
          ) : (
            <div className="space-y-3">
              {savedRecs.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl bg-gray-950/60 border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Seed Song:</span>
                      <p className="font-semibold text-white text-xs">{rec.seed_track_name}</p>
                      <p className="text-[11px] text-gray-400">{rec.seed_artist}</p>
                    </div>

                    <span className="text-gray-500 font-bold">➔</span>

                    <div>
                      <span className="text-[10px] text-emerald-400 block">AI Recommended Match:</span>
                      <p className="font-semibold text-white text-xs">{rec.recommended_track_name}</p>
                      <p className="text-[11px] text-gray-400">{rec.recommended_artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <span className="font-mono text-emerald-400 font-bold text-sm">
                      {Math.round(((rec.similarity_score + 1) / 2) * 100)}% Match
                    </span>
                    <button
                      onClick={() => handleDeleteSavedRec(rec.id)}
                      className="p-2 rounded-lg bg-gray-900 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete saved recommendation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
