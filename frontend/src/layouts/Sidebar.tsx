import React from 'react';
import {
  LayoutDashboard,
  TableProperties,
  Binary,
  BarChart3,
  Network,
  GitFork,
  ScatterChart,
  Disc3,
  Sparkles,
  Lightbulb,
  Heart,
  Music2
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'explorer'
  | 'preprocessing'
  | 'eda'
  | 'correlation'
  | 'clustering'
  | 'pca'
  | 'genres'
  | 'recommender'
  | 'insights'
  | 'favorites';

interface MenuItem {
  id: TabType;
  label: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
}

interface MenuGroup {
  group: string;
  items: MenuItem[];
}

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  favoritesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, favoritesCount = 0 }) => {
  const menuGroups: MenuGroup[] = [
    {
      group: 'Overview',
      items: [
        { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'explorer' as TabType, label: 'Dataset Explorer', icon: TableProperties, badge: '32.8k' },
        { id: 'preprocessing' as TabType, label: 'Data Preprocessing', icon: Binary },
      ],
    },
    {
      group: 'Analytics & EDA',
      items: [
        { id: 'eda' as TabType, label: 'Exploratory Analysis', icon: BarChart3 },
        { id: 'correlation' as TabType, label: 'Correlation Matrix', icon: Network },
        { id: 'genres' as TabType, label: 'Genre Segmentation', icon: Disc3 },
      ],
    },
    {
      group: 'Machine Learning',
      items: [
        { id: 'clustering' as TabType, label: 'K-Means Clustering', icon: GitFork, badge: 'k=6' },
        { id: 'pca' as TabType, label: 'PCA 2D Space', icon: ScatterChart },
        { id: 'insights' as TabType, label: 'Dynamic Insights', icon: Lightbulb },
      ],
    },
    {
      group: 'AI Recommender',
      items: [
        { id: 'recommender' as TabType, label: 'AI Recommender', icon: Sparkles, highlight: true },
        {
          id: 'favorites' as TabType,
          label: 'Favorites & Saved',
          icon: Heart,
          badge: favoritesCount > 0 ? String(favoritesCount) : undefined,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-gray-950/95 border-r border-white/5 flex flex-col justify-between p-4 sticky top-0 z-40 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Music2 className="w-5 h-5 text-black font-bold" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              SPOTIFY <span className="text-emerald-400">LAB</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">
              Music Intelligence ML
            </p>
          </div>
        </div>

        {/* Navigation Menus */}
        <div className="space-y-6">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx}>
              <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {group.group}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm shadow-emerald-500/10'
                          : 'text-gray-400 hover:text-white hover:bg-gray-900/60'
                      } ${item.highlight && !isActive ? 'hover:border-emerald-500/20' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive
                              ? 'text-emerald-400'
                              : item.highlight
                              ? 'text-emerald-500/70'
                              : 'text-gray-400'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] rounded-md font-mono ${
                            isActive
                              ? 'bg-emerald-500 text-black font-bold'
                              : 'bg-gray-800 text-gray-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset & System Status */}
      <div className="pt-4 border-t border-white/5 px-2">
        <div className="p-3 rounded-xl bg-gray-900/60 border border-white/5 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-gray-400 text-[11px]">ML Status</span>
            <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
          <p className="text-[11px] text-gray-300 font-medium">Spotify 32,833 Catalog</p>
          <p className="text-[10px] text-gray-400">K-Means (k=6) + PCA 2D</p>
        </div>
      </div>
    </aside>
  );
};
