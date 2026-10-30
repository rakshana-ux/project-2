import React from 'react';
import { Search, Sparkles, Database, Cpu, Music } from 'lucide-react';
import { TabType } from './Sidebar';

interface NavbarProps {
  activeTab: TabType;
  onOpenRecommenderWithQuery?: (query: string) => void;
  onSelectSongForDetail?: (song: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onOpenRecommenderWithQuery,
}) => {
  const [searchInput, setSearchInput] = React.useState('');

  const titles: Record<TabType, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Executive Music Dashboard',
      subtitle: 'Real-time Spotify catalog telemetry, feature radar & genre distribution',
    },
    explorer: {
      title: 'Spotify Dataset Explorer',
      subtitle: 'Search, filter and inspect 32,833 authentic audio tracks & characteristics',
    },
    preprocessing: {
      title: 'Data Preprocessing Pipeline',
      subtitle: 'Data scrubbing, missing value imputation, deduplication & StandardScaler',
    },
    eda: {
      title: 'Exploratory Data Analysis',
      subtitle: 'Continuous acoustic distributions, feature cross-sections & playlist metrics',
    },
    correlation: {
      title: 'Acoustic Correlation Matrix',
      subtitle: 'Pearson correlation heatmap with interactive cell inspections and acoustic insights',
    },
    clustering: {
      title: 'K-Means Clustering & Model Evaluation',
      subtitle: 'Inertia elbow curve, Silhouette scores, Davies-Bouldin index & cluster profiles',
    },
    pca: {
      title: 'Principal Component Analysis (PCA)',
      subtitle: 'High-dimensional audio compression into 2D latent coordinates with loadings',
    },
    genres: {
      title: 'Genre Segmentation & Cross-Analysis',
      subtitle: 'Acoustic benchmarking across the 6 major Spotify genres and 24 subgenres',
    },
    recommender: {
      title: 'AI Music Recommendation System',
      subtitle: 'Cosine similarity content-based similarity engine across scaled acoustic space',
    },
    insights: {
      title: 'Dynamic Music Intelligence & Insights',
      subtitle: 'Calculated algorithmic discoveries, genre polarities & acoustic patterns',
    },
    favorites: {
      title: 'Saved Recommendations & Favorites',
      subtitle: 'Locally persisted song bookmarks and custom recommendation sessions',
    },
  };

  const current = titles[activeTab] || {
    title: 'Spotify Genre Lab',
    subtitle: 'Music Intelligence & Recommendation System',
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim() && onOpenRecommenderWithQuery) {
      onOpenRecommenderWithQuery(searchInput.trim());
    }
  };

  return (
    <header className="h-20 bg-gray-950/70 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30 px-8 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          {current.title}
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Fast Global Search */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search song or artist..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-64 pl-9 pr-4 py-2 bg-gray-900/80 border border-white/10 rounded-full text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
          />
        </form>

        {/* Live System Indicators */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900/80 border border-white/10 text-xs text-gray-300">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-white">32,833</span>
          <span className="text-gray-400 text-[11px]">Songs</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-mono">FastAPI + Scikit-Learn</span>
        </div>
      </div>
    </header>
  );
};
