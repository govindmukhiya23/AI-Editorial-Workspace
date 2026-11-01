import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  RefreshCw,
  Edit3
} from 'lucide-react';

export default function SourceCard({ source, index, onRetry, onManualSubmit }) {
  const [expanded, setExpanded] = useState(false);
  const [isEditingManual, setIsEditingManual] = useState(false);
  const [manualText, setManualText] = useState(source.extractedContent || '');
  const [manualTitle, setManualTitle] = useState(source.title || '');

  const getStatusBadge = () => {
    switch (source.extractionStatus) {
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3 h-3" />
            <span>Extracted</span>
          </span>
        );
      case 'manual_input':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <FileText className="w-3 h-3" />
            <span>Manual Input</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Processing</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
            <AlertTriangle className="w-3 h-3" />
            <span>Extraction Failed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
    }
  };

  const handleSaveManual = (e) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    onManualSubmit(source._id, { title: manualTitle, content: manualText });
    setIsEditingManual(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3 min-w-0">
            <span className="shrink-0 w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center">
              {index + 1}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 truncate">
                {source.title || 'Untitled Source'}
              </h3>
              <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                {source.publisher && <span className="font-medium text-slate-700">{source.publisher}</span>}
                {source.publisher && source.url && <span>•</span>}
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:text-indigo-600 inline-flex items-center space-x-1"
                  >
                    <span className="truncate max-w-[280px] sm:max-w-md">{source.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="shrink-0 flex items-center space-x-2">
            {getStatusBadge()}
          </div>
        </div>

        {/* Failed Source Error Banner */}
        {source.extractionStatus === 'failed' && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            <p className="font-medium">Extraction Error: {source.errorMessage || 'Unable to access webpage.'}</p>
            <p className="mt-1 text-rose-600">
              Sites behind paywalls or dynamic JavaScript rendering can be provided manually.
            </p>
            <div className="mt-2.5 flex items-center space-x-2">
              <button
                onClick={() => onRetry && onRetry(source._id)}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 font-medium transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry Extraction</span>
              </button>
              <button
                onClick={() => setIsEditingManual(!isEditingManual)}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-white border border-rose-300 hover:bg-rose-50 text-rose-800 font-medium transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                <span>Provide Manual Text</span>
              </button>
            </div>
          </div>
        )}

        {/* Manual Input Form */}
        {isEditingManual && (
          <form onSubmit={handleSaveManual} className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <input
              type="text"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="Article title"
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-indigo-600"
            />
            <textarea
              rows={4}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Paste article content..."
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-indigo-600 font-mono-code"
              required
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEditingManual(false)}
                className="px-3 py-1 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded shadow-xs"
              >
                Save Content
              </button>
            </div>
          </form>
        )}

        {/* Extracted content toggle */}
        {source.extractedContent && !isEditingManual && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {source.extractedContent.split(/\s+/).length} words extracted
            </span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center space-x-1"
            >
              <span>{expanded ? 'Hide Content' : 'View Content'}</span>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {expanded && source.extractedContent && (
          <div className="mt-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200 max-h-60 overflow-y-auto text-xs text-slate-700 font-editorial leading-relaxed whitespace-pre-wrap">
            {source.extractedContent}
          </div>
        )}
      </div>
    </div>
  );
}
