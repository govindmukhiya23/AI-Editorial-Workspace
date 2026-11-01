import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle, Shuffle, ExternalLink } from 'lucide-react';

export default function EvidenceCard({ evidence }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'supported':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            <span>Supported</span>
          </span>
        );
      case 'partially_supported':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <AlertCircle className="w-3 h-3" />
            <span>Partially Supported</span>
          </span>
        );
      case 'unsupported':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <HelpCircle className="w-3 h-3" />
            <span>Unsupported Claim</span>
          </span>
        );
      case 'conflicting_evidence':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            <Shuffle className="w-3 h-3" />
            <span>Conflicting Sources</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-all hover:border-slate-300">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <h4 className="text-sm font-semibold text-slate-900 leading-snug">
          {evidence.claim}
        </h4>
        <div className="shrink-0">{getStatusBadge(evidence.status)}</div>
      </div>

      {evidence.excerpt && (
        <blockquote className="my-3 pl-3 py-1 border-l-2 border-indigo-300 bg-indigo-50/40 rounded-r text-xs text-slate-700 italic font-editorial leading-relaxed">
          "{evidence.excerpt}"
        </blockquote>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 mt-2">
        <span className="font-medium text-slate-700 truncate max-w-xs">
          Source: {evidence.sourceTitle || 'Referenced Source'}
        </span>
        {evidence.sourceUrl && (
          <a
            href={evidence.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-600 hover:text-indigo-800 inline-flex items-center space-x-1 shrink-0"
          >
            <span>View Source</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
