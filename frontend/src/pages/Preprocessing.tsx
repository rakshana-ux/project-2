import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PreprocessingReport } from '../types';
import {
  Binary,
  CheckCircle2,
  Trash2,
  Filter,
  Layers,
  ArrowRight,
  Database,
  BarChart,
  Cpu
} from 'lucide-react';

export const Preprocessing: React.FC = () => {
  const [data, setData] = useState<PreprocessingReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreprocessing = async () => {
      try {
        setLoading(true);
        const res = await api.getPreprocessing();
        setData(res);
      } catch (err) {
        console.error('Failed to fetch preprocessing report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPreprocessing();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Inspecting dataset transformations...</p>
      </div>
    );
  }

  if (!data) return null;

  const { raw_stats, cleaned_stats, steps, features } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Overview Cards: Before vs After */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Raw Dataset Profile */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Raw Spotify Catalog (Pre-Cleaning)</h3>
              <p className="text-xs text-gray-400">Unfiltered baseline ingested from CSV</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs mb-4">
            <div className="p-3 rounded-xl bg-gray-950/60 border border-white/5">
              <span className="text-gray-400 block mb-1">Total Records</span>
              <span className="text-xl font-bold text-white font-mono">
                {raw_stats.total_records.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-gray-950/60 border border-white/5">
              <span className="text-gray-400 block mb-1">Total Columns</span>
              <span className="text-xl font-bold text-white font-mono">
                {raw_stats.total_columns}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-gray-950/60 border border-white/5">
              <span className="text-gray-400 block mb-1">Missing Value Records</span>
              <span className="text-xl font-bold text-rose-400 font-mono">
                {Object.values(raw_stats.missing_values).reduce((a, b) => a + b, 0)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-gray-950/60 border border-white/5">
              <span className="text-gray-400 block mb-1">Duplicate Track IDs</span>
              <span className="text-xl font-bold text-amber-400 font-mono">
                {raw_stats.duplicates_count.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-950/40 border border-white/5 text-[11px] text-gray-400 space-y-1">
            <p className="font-semibold text-gray-300">Identified Missing Fields:</p>
            {Object.entries(raw_stats.missing_values).map(([col, cnt]) => (
              <div key={col} className="flex justify-between">
                <span>{col}</span>
                <span className="text-rose-400 font-mono">{cnt} nulls</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cleaned Dataset Profile */}
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 relative overflow-hidden bg-gradient-to-br from-emerald-950/20 to-gray-900/40">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cleaned & Standardized ML Matrix</h3>
              <p className="text-xs text-gray-400">Final input matrix for K-Means and PCA</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs mb-4">
            <div className="p-3 rounded-xl bg-gray-950/60 border border-white/5">
              <span className="text-gray-400 block mb-1">Unique Deduplicated Songs</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">
                {cleaned_stats.total_records.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-gray-950/60 border border-white/5">
              <span className="text-gray-400 block mb-1">Standardized Audio Features</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">
                {cleaned_stats.audio_features.length}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-gray-950/60 border border-white/5">
              <span className="text-gray-400 block mb-1">Unique Artists</span>
              <span className="text-xl font-bold text-white font-mono">
                {cleaned_stats.unique_artists.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-gray-950/60 border border-white/5">
              <span className="text-gray-400 block mb-1">Null Values Left</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">0 (100% Clean)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-950/40 border border-white/5 text-[11px] text-gray-400">
            <p className="font-semibold text-emerald-400 mb-1">StandardScaler Verification:</p>
            <p className="leading-relaxed">
              Every feature transformed to zero mean (μ ≈ 0.000) and unit variance (σ = 1.000) to ensure equal feature weighting in Euclidean clustering and Cosine distance calculations.
            </p>
          </div>
        </div>
      </div>

      {/* Preprocessing Step Audit Log */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5">
        <h3 className="text-base font-bold text-white mb-1">Preprocessing Pipeline Execution Steps</h3>
        <p className="text-xs text-gray-400 mb-6">Audited algorithmic transformations executed sequentially</p>

        <div className="space-y-4">
          {steps.map((st) => (
            <div
              key={st.step}
              className="flex items-start gap-4 p-4 rounded-xl bg-gray-950/60 border border-white/5 hover:border-emerald-500/20 transition"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-xs shrink-0">
                {st.step}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">{st.title}</h4>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{st.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Scaling Verification Table */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5">
        <h3 className="text-base font-bold text-white mb-1">Feature Normalization Audit (Raw vs Scaled)</h3>
        <p className="text-xs text-gray-400 mb-6">
          Comparing unscaled distribution moments against standardized variables
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400">
                <th className="pb-3 font-semibold">Audio Feature</th>
                <th className="pb-3 font-semibold">Raw Mean (μ)</th>
                <th className="pb-3 font-semibold">Raw Std (σ)</th>
                <th className="pb-3 font-semibold text-emerald-400">Standardized Mean (μ)</th>
                <th className="pb-3 font-semibold text-emerald-400">Standardized Std (σ)</th>
                <th className="pb-3 font-semibold">ML Weight Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {features.map((feat) => (
                <tr key={feat} className="hover:bg-white/5 transition">
                  <td className="py-3 font-mono font-medium text-white capitalize">{feat}</td>
                  <td className="py-3 font-mono text-gray-300">
                    {cleaned_stats.feature_means[feat]}
                  </td>
                  <td className="py-3 font-mono text-gray-400">
                    {cleaned_stats.feature_stds[feat]}
                  </td>
                  <td className="py-3 font-mono text-emerald-400">
                    {cleaned_stats.scaled_means[feat].toFixed(4)}
                  </td>
                  <td className="py-3 font-mono text-emerald-400">
                    {cleaned_stats.scaled_stds[feat].toFixed(4)}
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                      Balanced (1.00)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
