import React from 'react';
import { Check, X, Sparkles, MessageSquare } from 'lucide-react';

export default function SuggestionCard({ suggestion, onAccept, onReject, isUpdating }) {
  const getBadgeStyle = (type) => {
    switch (type) {
      case 'long_sentence':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'passive_voice':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'jargon':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'filler_words':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'repetition':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const formatIssueType = (type) => {
    switch (type) {
      case 'long_sentence':
        return 'Long / Complex Sentence';
      case 'passive_voice':
        return 'Passive Voice';
      case 'jargon':
        return 'Unexplained Jargon';
      case 'filler_words':
        return 'Filler Phrase';
      case 'repetition':
        return 'Redundancy / Repetition';
      default:
        return type;
    }
  };

  const isAccepted = suggestion.status === 'accepted';
  const isRejected = suggestion.status === 'rejected';

  return (
    <div
      className={`rounded-xl border p-4.5 transition-all ${
        isAccepted
          ? 'bg-emerald-50/50 border-emerald-300'
          : isRejected
          ? 'bg-slate-50 border-slate-200 opacity-60'
          : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${getBadgeStyle(
            suggestion.issueType
          )}`}
        >
          {formatIssueType(suggestion.issueType)}
        </span>

        {isAccepted && (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center space-x-1">
            <Check className="w-3 h-3" />
            <span>Applied</span>
          </span>
        )}
        {isRejected && (
          <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full inline-flex items-center space-x-1">
            <X className="w-3 h-3" />
            <span>Dismissed</span>
          </span>
        )}
      </div>

      {/* Original Passage */}
      <div className="mb-2">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Original:</span>
        <p className="text-xs text-rose-900 bg-rose-50/60 p-2 rounded border border-rose-100 font-editorial leading-relaxed mt-0.5 line-through">
          {suggestion.originalText}
        </p>
      </div>

      {/* Suggested Rewrite */}
      <div className="mb-2.5">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Suggested Rewrite:</span>
        <p className="text-xs text-emerald-900 bg-emerald-50/60 p-2 rounded border border-emerald-100 font-editorial leading-relaxed mt-0.5 font-medium">
          {suggestion.suggestedText || '<Remove phrase>'}
        </p>
      </div>

      {/* Explanation */}
      <div className="flex items-start space-x-1.5 text-xs text-slate-600 mb-3 bg-slate-50 p-2 rounded">
        <MessageSquare className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
        <span className="leading-snug">{suggestion.explanation}</span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
        <button
          onClick={() => onReject(suggestion._id)}
          disabled={isUpdating || isRejected}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1 ${
            isRejected
              ? 'bg-slate-200 text-slate-600 cursor-default'
              : 'text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer'
          }`}
        >
          <X className="w-3.5 h-3.5" />
          <span>{isRejected ? 'Rejected' : 'Reject'}</span>
        </button>

        <button
          onClick={() => onAccept(suggestion._id)}
          disabled={isUpdating || isAccepted}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 ${
            isAccepted
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>{isAccepted ? 'Accepted' : 'Accept Rewrite'}</span>
        </button>
      </div>
    </div>
  );
}

