import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CorrelationData } from '../types';
import { Network, Info, ArrowUpRight, ArrowDownRight, Layers, Sparkles } from 'lucide-react';

export const Correlation: React.FC = () => {
  const [data, setData] = useState<CorrelationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<{
    f1: string;
    f2: string;
    val: number;
    explanation?: string;
  } | null>(null);

  useEffect(() => {
    const fetchCorrelation = async () => {
      try {
        setLoading(true);
        const res = await api.getCorrelation();
        setData(res);
        if (res.top_pairs && res.top_pairs.length > 0) {
          const top = res.top_pairs[0];
          setSelectedCell({
            f1: top.feature_1,
            f2: top.feature_2,
            val: top.correlation,
            explanation: top.explanation,
          });
        }
      } catch (err) {
        console.error('Failed to load correlation matrix:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCorrelation();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Computing Pearson correlation coefficients...</p>
      </div>
    );
  }

  if (!data) return null;

  const { features, matrix, top_pairs, summary } = data;

  // Helper to color heatmap cells based on Pearson correlation value (-1 to +1)
  const getCellColor = (val: number) => {
    if (val === 1) return 'bg-emerald-500 text-black font-bold';
    if (val > 0.5) return 'bg-emerald-500/60 text-emerald-100 font-semibold';
    if (val > 0.25) return 'bg-emerald-500/35 text-emerald-200';
    if (val > 0.05) return 'bg-emerald-500/15 text-gray-300';
    if (val >= -0.05) return 'bg-gray-800/40 text-gray-400';
    if (val > -0.25) return 'bg-rose-500/20 text-rose-200';
    if (val > -0.5) return 'bg-rose-500/40 text-rose-100 font-semibold';
    return 'bg-rose-500/70 text-white font-bold';
  };

  const handleCellClick = (f1: string, f2: string, val: number) => {
    const foundPair = data.all_pairs.find(
      (p) =>
        (p.feature_1 === f1 && p.feature_2 === f2) ||
        (p.feature_1 === f2 && p.feature_2 === f1)
    );
    setSelectedCell({
      f1,
      f2,
      val,
      explanation: foundPair?.explanation || (f1 === f2 ? "Identity correlation (r = 1.000) with itself." : undefined),
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Highlights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {summary.strongest_positive && (
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-gray-900/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" /> Strongest Positive Correlation
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                r = {summary.strongest_positive.correlation}
              </span>
            </div>
            <h4 className="text-lg font-bold text-white mb-1 capitalize">
              {summary.strongest_positive.feature_1} & {summary.strongest_positive.feature_2}
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              {summary.strongest_positive.explanation}
            </p>
          </div>
        )}

        {summary.strongest_negative && (
          <div className="glass-panel p-6 rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-950/20 to-gray-900/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                <ArrowDownRight className="w-4 h-4" /> Strongest Negative Trade-off
              </span>
              <span className="text-xs font-mono font-bold text-rose-400 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                r = {summary.strongest_negative.correlation}
              </span>
            </div>
            <h4 className="text-lg font-bold text-white mb-1 capitalize">
              {summary.strongest_negative.feature_1} & {summary.strongest_negative.feature_2}
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              {summary.strongest_negative.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Interactive Heatmap Matrix */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-emerald-400" /> Pearson Correlation Matrix Heatmap
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Click any cell to reveal acoustic interpretation and production context
            </p>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-2 text-[10px] text-gray-400 bg-gray-900/80 px-3 py-1.5 rounded-xl border border-white/5">
            <span>Inverse (-1.0)</span>
            <div className="w-24 h-2.5 rounded bg-gradient-to-r from-rose-500 via-gray-700 to-emerald-500" />
            <span>Direct (+1.0)</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-gray-400 font-semibold text-[11px]">Feature</th>
                {features.map((f) => (
                  <th
                    key={f}
                    className="p-2 font-medium text-gray-300 text-[11px] capitalize max-w-[70px] truncate"
                    title={f}
                  >
                    {f.slice(0, 7)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => (
                <tr key={row.feature}>
                  <td className="p-2 text-left font-medium text-white text-[11px] capitalize whitespace-nowrap">
                    {row.feature}
                  </td>
                  {features.map((f) => {
                    const val = row[f];
                    const isSelected =
                      selectedCell &&
                      ((selectedCell.f1 === row.feature && selectedCell.f2 === f) ||
                        (selectedCell.f2 === row.feature && selectedCell.f1 === f));

                    return (
                      <td
                        key={f}
                        onClick={() => handleCellClick(row.feature, f, val)}
                        className={`p-2 transition cursor-pointer select-none border border-black/20 ${getCellColor(
                          val
                        )} ${
                          isSelected ? 'ring-2 ring-white scale-105 z-10 rounded' : 'hover:opacity-80'
                        }`}
                        title={`${row.feature} vs ${f}: ${val}`}
                      >
                        <span className="font-mono text-[11px]">{val.toFixed(2)}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Interactive Cell Inspector Card */}
        {selectedCell && (
          <div className="mt-4 p-4 rounded-xl bg-gray-950/80 border border-emerald-500/30 flex items-start gap-4 animate-in fade-in">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white capitalize">
                  {selectedCell.f1} ↔ {selectedCell.f2}
                </h4>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                    selectedCell.val > 0
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : selectedCell.val < 0
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  Pearson r = {selectedCell.val}
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                {selectedCell.explanation ||
                  `Calculated correlation of ${selectedCell.val} between ${selectedCell.f1} and ${selectedCell.f2}.`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Ranked Pairwise Relationships */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5">
        <h3 className="text-base font-bold text-white mb-1">Ranked Significant Feature Pairs</h3>
        <p className="text-xs text-gray-400 mb-6">Key audio dependencies extracted from the correlation analysis</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {top_pairs.map((pair, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-gray-950/60 border border-white/5 hover:border-white/10 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-semibold text-white text-xs capitalize">
                    {pair.feature_1} & {pair.feature_2}
                  </span>
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                      pair.correlation > 0
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    r = {pair.correlation}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed mb-2">{pair.explanation}</p>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300">
                  {pair.strength} Association
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">{pair.direction} Vector</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
