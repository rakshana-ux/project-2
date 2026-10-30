import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MusicInsight } from '../types';
import {
  Lightbulb,
  Sparkles,
  Flame,
  Activity,
  Award,
  Zap,
  TrendingUp,
  Network,
  GitFork
} from 'lucide-react';

export const MusicInsights: React.FC = () => {
  const [insights, setInsights] = useState<MusicInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const res = await api.getInsights();
        setInsights(res.insights);
      } catch (err) {
        console.error('Failed to load insights:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Synthesizing dynamic dataset intelligence...</p>
      </div>
    );
  }

  const getCategoryIcon = (cat: string) => {
    if (cat.includes('Energy')) return <Flame className="w-5 h-5 text-amber-400" />;
    if (cat.includes('Motion') || cat.includes('Dance')) return <Activity className="w-5 h-5 text-emerald-400" />;
    if (cat.includes('Popularity')) return <Award className="w-5 h-5 text-yellow-400" />;
    if (cat.includes('Correlation')) return <Network className="w-5 h-5 text-purple-400" />;
    if (cat.includes('Cluster')) return <GitFork className="w-5 h-5 text-cyan-400" />;
    return <Zap className="w-5 h-5 text-blue-400" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden bg-gradient-to-r from-emerald-950/40 to-gray-900/60">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
            <Lightbulb className="w-3.5 h-3.5 text-emerald-400" /> Algorithmic Dataset Synthesis
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Dynamic Musical Intelligence & Findings
          </h2>
          <p className="text-gray-300 text-xs mt-1 leading-relaxed">
            Automated analytical takeaways derived directly from the statistical distribution, correlation matrix, and unsupervised clustering of the 32,833 songs.
          </p>
        </div>
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((item, idx) => (
          <div
            key={idx}
            className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gray-950/80 border border-white/5">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                      {item.category}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">{item.badge}</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-gray-900 text-white border border-white/10">
                  {item.stat}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-2 group-hover:text-emerald-400 transition">
                {item.title}
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">{item.description}</p>
            </div>

            <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
              <span>Dynamic Intelligence Engine</span>
              <span className="text-emerald-400 font-medium">Verified by ML Pipeline</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
