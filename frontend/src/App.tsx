import React, { useState, useEffect } from 'react';
import { Sidebar, TabType } from './layouts/Sidebar';
import { Navbar } from './layouts/Navbar';
import { SongDetailModal } from './components/SongDetailModal';
import { Song } from './types';
import { api } from './services/api';

// Pages
import { Dashboard } from './pages/Dashboard';
import { DatasetExplorer } from './pages/DatasetExplorer';
import { Preprocessing } from './pages/Preprocessing';
import { EDA } from './pages/EDA';
import { Correlation } from './pages/Correlation';
import { Clustering } from './pages/Clustering';
import { PCAPage } from './pages/PCA';
import { GenreSegmentation } from './pages/GenreSegmentation';
import { RecommendationEngine } from './pages/RecommendationEngine';
import { MusicInsights } from './pages/MusicInsights';
import { SavedFavorites } from './pages/SavedFavorites';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedSongForModal, setSelectedSongForModal] = useState<Song | null>(null);
  const [seedSongForRecommender, setSeedSongForRecommender] = useState<Song | null>(null);
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const [favoritesMap, setFavoritesMap] = useState<Record<string, boolean>>({});

  // Load initial favorites count
  useEffect(() => {
    const fetchFavs = async () => {
      try {
        const favs = await api.getFavorites();
        setFavoritesCount(favs.length);
        const map: Record<string, boolean> = {};
        favs.forEach((f: any) => {
          map[f.track_id] = true;
        });
        setFavoritesMap(map);
      } catch (err) {
        console.error('Failed to load initial favorites:', err);
      }
    };
    fetchFavs();
  }, []);

  const handleSelectSong = (song: any) => {
    setSelectedSongForModal(song);
  };

  const handleNavigateToRecommender = (song: any) => {
    setSeedSongForRecommender(song);
    setActiveTab('recommender');
  };

  const handleGlobalSearch = (query: string) => {
    setActiveTab('explorer');
  };

  const handleToggleFavorite = async (song: Song) => {
    const isFav = !!favoritesMap[song.track_id];
    try {
      if (isFav) {
        await api.removeFavorite(song.track_id);
        const nextMap = { ...favoritesMap };
        delete nextMap[song.track_id];
        setFavoritesMap(nextMap);
        setFavoritesCount((prev) => Math.max(0, prev - 1));
      } else {
        await api.addFavorite(song);
        setFavoritesMap((prev) => ({ ...prev, [song.track_id]: true }));
        setFavoritesCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#080b11] text-gray-100 antialiased selection:bg-emerald-500 selection:text-black">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favoritesCount={favoritesCount}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          activeTab={activeTab}
          onOpenRecommenderWithQuery={handleGlobalSearch}
        />

        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              onSelectSong={handleSelectSong}
              onNavigateToRecommender={handleNavigateToRecommender}
            />
          )}

          {activeTab === 'explorer' && (
            <DatasetExplorer
              onSelectSong={handleSelectSong}
              onNavigateToRecommender={handleNavigateToRecommender}
            />
          )}

          {activeTab === 'preprocessing' && <Preprocessing />}

          {activeTab === 'eda' && <EDA />}

          {activeTab === 'correlation' && <Correlation />}

          {activeTab === 'clustering' && (
            <Clustering
              onSelectSong={handleSelectSong}
              onNavigateToRecommender={handleNavigateToRecommender}
            />
          )}

          {activeTab === 'pca' && (
            <PCAPage
              onSelectSong={handleSelectSong}
              onNavigateToRecommender={handleNavigateToRecommender}
            />
          )}

          {activeTab === 'genres' && <GenreSegmentation />}

          {activeTab === 'recommender' && (
            <RecommendationEngine
              initialSeedSong={seedSongForRecommender}
              onSelectSong={handleSelectSong}
              onSaveFavorite={handleToggleFavorite}
            />
          )}

          {activeTab === 'insights' && <MusicInsights />}

          {activeTab === 'favorites' && (
            <SavedFavorites
              onSelectSong={handleSelectSong}
              onNavigateToRecommender={handleNavigateToRecommender}
              onUpdateFavoritesCount={setFavoritesCount}
            />
          )}
        </main>
      </div>

      {/* Song Detail Modal */}
      <SongDetailModal
        song={selectedSongForModal}
        onClose={() => setSelectedSongForModal(null)}
        onRecommendSimilar={handleNavigateToRecommender}
        onToggleFavorite={handleToggleFavorite}
        isFavorite={selectedSongForModal ? !!favoritesMap[selectedSongForModal.track_id] : false}
      />
    </div>
  );
};

export default App;
