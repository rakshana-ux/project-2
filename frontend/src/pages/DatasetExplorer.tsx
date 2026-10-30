import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Song } from '../types';
import { AudioFeatureBar } from '../components/AudioFeatureBar';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Disc,
  Sparkles,
  SlidersHorizontal,
  Info
} from 'lucide-react';

interface DatasetExplorerProps {
  onSelectSong: (song: Song) => void;
  onNavigateToRecommender: (song: Song) => void;
}

const GENRES = ['all', 'edm', 'rap', 'pop', 'r&b', 'latin', 'rock'];

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({
  onSelectSong,
  onNavigateToRecommender,
}) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [minPopularity, setMinPopularity] = useState(0);
  const [sortBy, setSortBy] = useState('track_popularity');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const res = await api.getDataset({
        page,
        page_size: pageSize,
        search: search || undefined,
        genre: selectedGenre !== 'all' ? selectedGenre : undefined,
        min_popularity: minPopularity > 0 ? minPopularity : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setSongs(res.items);
      setTotalItems(res.total_items);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error('Failed to load dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, [page, pageSize, selectedGenre, minPopularity, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSongs();
  };

  const handleSortChange = (col: string) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Controls Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Disc className="w-5 h-5 text-emerald-400" /> Catalog Track Explorer
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Querying {totalItems.toLocaleString()} active records in the Spotify database
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search track or artist..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5 text-xs">
          {/* Genre Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-gray-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Genre:
            </span>
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => {
                  setSelectedGenre(g);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-lg uppercase tracking-wider text-[11px] font-medium transition ${
                  selectedGenre === g
                    ? 'bg-emerald-500 text-black font-bold'
                    : 'bg-gray-900/80 text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Min Popularity Slider */}
          <div className="flex items-center gap-3 bg-gray-900/80 px-3 py-1.5 rounded-xl border border-white/5">
            <span className="text-gray-400 text-xs">Min Popularity:</span>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minPopularity}
              onChange={(e) => {
                setMinPopularity(Number(e.target.value));
                setPage(1);
              }}
              className="w-24 accent-emerald-500 cursor-pointer"
            />
            <span className="font-mono text-emerald-400 font-semibold w-6">{minPopularity}</span>
          </div>
        </div>
      </div>

      {/* Dataset Table */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950/80 border-b border-white/10 text-gray-400 select-none">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Track & Artist</th>
                <th className="py-3.5 px-4 font-semibold">Genre / Subgenre</th>
                <th
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-emerald-400 transition"
                  onClick={() => handleSortChange('track_popularity')}
                >
                  <div className="flex items-center gap-1">
                    Popularity
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-emerald-400 transition w-36"
                  onClick={() => handleSortChange('danceability')}
                >
                  <div className="flex items-center gap-1">
                    Danceability
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-emerald-400 transition w-36"
                  onClick={() => handleSortChange('energy')}
                >
                  <div className="flex items-center gap-1">
                    Energy
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-emerald-400 transition"
                  onClick={() => handleSortChange('tempo')}
                >
                  <div className="flex items-center gap-1">
                    Tempo
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold">Cluster</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
                      Loading records...
                    </div>
                  </td>
                </tr>
              ) : songs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    No songs match your search or filter parameters.
                  </td>
                </tr>
              ) : (
                songs.map((song) => (
                  <tr
                    key={song.track_id}
                    onClick={() => onSelectSong(song)}
                    className="hover:bg-white/5 transition group cursor-pointer"
                  >
                    <td className="py-3 px-4 max-w-[240px]">
                      <p className="font-semibold text-white group-hover:text-emerald-400 transition truncate">
                        {song.track_name}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">{song.track_artist}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-800 text-gray-200 border border-white/10 mr-1.5 uppercase">
                        {song.playlist_genre}
                      </span>
                      <span className="text-[10px] text-gray-400">{song.playlist_subgenre}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-white">{song.popularity}</span>
                        <div className="w-12 bg-gray-800 rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-emerald-400 h-full rounded-full"
                            style={{ width: `${song.popularity}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 w-36">
                      <AudioFeatureBar
                        label=""
                        value={song.danceability}
                        color="from-green-500 to-emerald-400"
                        showPercentage={true}
                      />
                    </td>

                    <td className="py-3 px-4 w-36">
                      <AudioFeatureBar
                        label=""
                        value={song.energy}
                        color="from-amber-500 to-yellow-400"
                        showPercentage={true}
                      />
                    </td>

                    <td className="py-3 px-4 font-mono text-gray-300">
                      {Math.round(song.tempo)} BPM
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        C#{song.cluster ?? 0}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-400">
          <div>
            Showing Page <strong className="text-white">{page}</strong> of{' '}
            <strong className="text-white">{totalPages}</strong> ({totalItems.toLocaleString()} total songs)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-gray-900 border border-white/10 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded-lg bg-gray-900 border border-white/10 font-mono text-white">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-gray-900 border border-white/10 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
