import React from 'react';
import { Type, Clock, Activity, AlignLeft } from 'lucide-react';

export default function WritingMetrics({ metrics }) {
  if (!metrics) return null;

  const getReadabilityColor = (score) => {
    if (score >= 70) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Editorial Readability Metrics
        </h3>
        <span className="text-[11px] text-slate-400">Deterministic Analysis</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Word Count */}
        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1">
            <Type className="w-3.5 h-3.5 text-indigo-500" />
            <span>Word Count</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {metrics.wordCount || 0}
          </div>
          <span className="text-[10px] text-slate-400">Target: 300–500 words</span>
        </div>

        {/* Avg Sentence Length */}
        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1">
            <AlignLeft className="w-3.5 h-3.5 text-indigo-500" />
            <span>Avg Sentence</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {metrics.averageSentenceLength || 0}
          </div>
          <span className="text-[10px] text-slate-400">words / sentence</span>
        </div>

        {/* Reading Time */}
        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>Reading Time</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            ~{metrics.readingTime || 1} min
          </div>
          <span className="text-[10px] text-slate-400">@ 200 wpm baseline</span>
        </div>

        {/* Readability Score */}
        <div className={`p-3.5 rounded-lg border ${getReadabilityColor(metrics.readabilityScore)}`}>
          <div className="flex items-center space-x-2 text-xs mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span className="font-medium">Readability</span>
          </div>
          <div className="text-2xl font-bold tracking-tight">
            {metrics.readabilityScore ?? 100}/100
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider">
            {metrics.readingLevel || 'Standard'}
          </span>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-slate-400 italic">
        * Note: Readability scores are automated indicators to guide editorial judgment, not definitive measures of prose quality.
      </p>
    </div>
  );
}
