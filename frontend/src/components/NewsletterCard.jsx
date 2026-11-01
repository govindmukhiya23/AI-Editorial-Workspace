import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  PenTool, 
  Copy, 
  Check, 
  Trash2, 
  ExternalLink,
  Download
} from 'lucide-react';

export default function NewsletterCard({ newsletter, onDelete, onStatusChange }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const fullText = `# ${newsletter.headline}\n\n${newsletter.body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const fullText = `# ${newsletter.headline}\n\n${newsletter.body}`;
    const blob = new Blob([fullText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${newsletter.headline.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenInWritingAssistant = () => {
    navigate('/writing', {
      state: {
        initialText: newsletter.body,
        initialTitle: newsletter.headline,
        researchSessionId: newsletter.researchSessionId?._id || newsletter.researchSessionId
      }
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'finalized':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'under_review':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadge(
              newsletter.status
            )}`}
          >
            {newsletter.status?.replace('_', ' ') || 'Draft'}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {newsletter.wordCount || 0} words
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-900 tracking-tight mb-2 hover:text-indigo-600 cursor-pointer">
          {newsletter.headline}
        </h3>

        <p className="text-xs text-slate-600 font-editorial leading-relaxed line-clamp-3 mb-4">
          {newsletter.body}
        </p>

        {newsletter.sources && newsletter.sources.length > 0 && (
          <div className="text-[11px] text-slate-400 mb-4">
            <span>Backed by {newsletter.sources.length} verified sources</span>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleOpenInWritingAssistant}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 text-xs font-semibold transition-colors"
            title="Polish in Writing Assistant"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Improve Writing</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Copy Markdown"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleExport}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Export as Markdown (.md)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(newsletter._id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete Newsletter"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

