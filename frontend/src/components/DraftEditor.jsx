import React from 'react';
import { Sparkles, Trash2, Save, RotateCcw } from 'lucide-react';

export default function DraftEditor({
  text,
  onChange,
  onAnalyze,
  onClear,
  onSave,
  isAnalyzing,
  isSaving,
  title,
  onTitleChange,
  wordCount
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Editor Header Bar */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Draft Title..."
          className="text-base font-bold text-slate-900 bg-transparent border-0 focus:ring-0 p-0 focus:outline-none placeholder:text-slate-400 w-full sm:w-auto"
        />

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={onClear}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
            title="Clear Draft"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving || !text.trim()}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onAnalyze}
            disabled={isAnalyzing || !text.trim()}
            className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analyze Draft</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 p-5 relative flex flex-col">
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write or paste your newsletter draft here to review readability, passive voice, jargon, and flow..."
          className="w-full flex-1 min-h-[380px] text-sm sm:text-base font-editorial leading-relaxed text-slate-800 focus:outline-none resize-none placeholder:text-slate-300"
        />
      </div>

      {/* Editor Footer Status */}
      <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-3">
          <span className="font-medium text-slate-700">{wordCount || 0} words</span>
          <span>•</span>
          <span>Target: 300–500 words</span>
        </div>
        <span className="text-[11px] text-slate-400">Editorial Hemingway-Inspired Engine</span>
      </div>
    </div>
  );
}
