import React, { useState } from 'react';
import { Plus, Trash2, Link, FileText, AlertCircle } from 'lucide-react';

export default function SourceInput({ sources, onChange, onSubmit, isSubmitting, sessionTitle, onTitleChange }) {
  const [error, setError] = useState('');

  const addSource = () => {
    onChange([
      ...sources,
      { id: Date.now().toString(), type: 'url', url: '', title: '', manualContent: '', publisher: '' }
    ]);
  };

  const removeSource = (index) => {
    if (sources.length <= 3) {
      setError('A minimum of three sources is required for a complete editorial synthesis.');
      setTimeout(() => setError(''), 4000);
      return;
    }
    const updated = sources.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const updateSource = (index, field, value) => {
    const updated = [...sources];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const validateAndSubmit = (e) => {
    e.preventDefault();
    if (!sessionTitle.trim()) {
      setError('Please provide a research topic or session title.');
      return;
    }

    if (sources.length < 3) {
      setError('You must provide at least three sources.');
      return;
    }

    // Check for duplicates
    const urls = sources.filter(s => s.type === 'url' && s.url.trim()).map(s => s.url.trim().toLowerCase());
    const uniqueUrls = new Set(urls);
    if (urls.length !== uniqueUrls.size) {
      setError('Duplicate URLs detected. Each source must point to a distinct article.');
      return;
    }

    // Check completeness
    for (let i = 0; i < sources.length; i++) {
      const s = sources[i];
      if (s.type === 'url' && !s.url.trim()) {
        setError(`Source #${i + 1} is missing a URL.`);
        return;
      }
      if (s.type === 'manual' && (!s.manualContent || !s.manualContent.trim())) {
        setError(`Source #${i + 1} has empty manual content.`);
        return;
      }
    }

    setError('');
    onSubmit();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
      <form onSubmit={validateAndSubmit} className="space-y-6">
        {/* Session Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Research Session Topic / Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={sessionTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g. Compound AI Systems & Small Models in 2026"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm transition-all"
            required
          />
        </div>

        {/* Source Inputs Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Sources (Minimum 3 Required)
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Add public article URLs or paste raw text if the article is behind a paywall.
              </p>
            </div>
            <button
              type="button"
              onClick={addSource}
              className="inline-flex items-center space-x-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-3 py-1.5 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Source</span>
            </button>
          </div>

          <div className="space-y-4">
            {sources.map((source, index) => (
              <div
                key={source.id || index}
                className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="inline-flex rounded-md shadow-xs bg-slate-200/60 p-0.5 text-xs">
                      <button
                        type="button"
                        onClick={() => updateSource(index, 'type', 'url')}
                        className={`flex items-center space-x-1 px-2.5 py-1 rounded-sm font-medium transition-all ${
                          source.type === 'url' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Link className="w-3 h-3" />
                        <span>URL</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateSource(index, 'type', 'manual')}
                        className={`flex items-center space-x-1 px-2.5 py-1 rounded-sm font-medium transition-all ${
                          source.type === 'manual' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <FileText className="w-3 h-3" />
                        <span>Paste Content</span>
                      </button>
                    </div>
                  </div>

                  {sources.length > 3 && (
                    <button
                      type="button"
                      onClick={() => removeSource(index)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove source"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {source.type === 'url' ? (
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={source.url}
                      onChange={(e) => updateSource(index, 'url', e.target.value)}
                      placeholder="https://techcrunch.com/article-or-announcement..."
                      className="w-full px-3 py-2 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                      required
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={source.title}
                        onChange={(e) => updateSource(index, 'title', e.target.value)}
                        placeholder="Optional title hint (e.g. OpenAI Benchmarks)"
                        className="w-1/2 px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 bg-white text-slate-600"
                      />
                      <input
                        type="text"
                        value={source.publisher}
                        onChange={(e) => updateSource(index, 'publisher', e.target.value)}
                        placeholder="Optional publisher (e.g. Ars Technica)"
                        className="w-1/2 px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 bg-white text-slate-600"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={source.title}
                        onChange={(e) => updateSource(index, 'title', e.target.value)}
                        placeholder="Article or Paper Title"
                        className="w-2/3 px-3 py-1.5 rounded-md border border-slate-300 text-xs focus:outline-none focus:border-indigo-500 bg-white"
                        required
                      />
                      <input
                        type="text"
                        value={source.publisher}
                        onChange={(e) => updateSource(index, 'publisher', e.target.value)}
                        placeholder="Publisher or Author"
                        className="w-1/3 px-3 py-1.5 rounded-md border border-slate-300 text-xs focus:outline-none focus:border-indigo-500 bg-white"
                      />
                    </div>
                    <textarea
                      rows={4}
                      value={source.manualContent}
                      onChange={(e) => updateSource(index, 'manualContent', e.target.value)}
                      placeholder="Paste full article text, announcement memo, or paper abstract here..."
                      className="w-full px-3 py-2 rounded-md border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white font-mono-code text-slate-800"
                      required
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-rose-600 bg-rose-50 border border-rose-200 px-4 py-3 rounded-lg text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Extracting & Analyzing Sources...</span>
              </>
            ) : (
              <span>Generate Research Brief</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

