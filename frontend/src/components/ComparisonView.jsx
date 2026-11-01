import React, { useState } from 'react';
import { Copy, Check, ArrowRight, Sparkles } from 'lucide-react';

export default function ComparisonView({ originalText, revisedText, suggestions }) {
  const [copied, setCopied] = useState(false);

  const acceptedSuggestions = (suggestions || []).filter(s => s.status === 'accepted');

  const handleCopy = () => {
    navigator.clipboard.writeText(revisedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Accepted Changes Summary */}
      <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-indigo-900 text-xs">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong className="font-semibold">{acceptedSuggestions.length}</strong> suggestion
            {acceptedSuggestions.length !== 1 ? 's' : ''} applied to the revised draft.
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-50 text-xs font-semibold shadow-2xs transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Revised Draft</span>
            </>
          )}
        </button>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Draft */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Original Draft
            </span>
            <span className="text-xs text-slate-400">
              {originalText.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <div className="p-5 font-editorial text-sm sm:text-base leading-relaxed text-slate-700 whitespace-pre-wrap max-h-[500px] overflow-y-auto">
            {originalText}
          </div>
        </div>

        {/* Revised Draft */}
        <div className="bg-white rounded-xl border border-indigo-200 shadow-xs flex flex-col overflow-hidden ring-1 ring-indigo-500/10">
          <div className="px-5 py-3 border-b border-indigo-100 bg-indigo-50/40 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>Revised & Polished Draft</span>
            </span>
            <span className="text-xs text-indigo-600 font-medium">
              {revisedText.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <div className="p-5 font-editorial text-sm sm:text-base leading-relaxed text-slate-900 whitespace-pre-wrap max-h-[500px] overflow-y-auto">
            {revisedText}
          </div>
        </div>
      </div>
    </div>
  );
}

