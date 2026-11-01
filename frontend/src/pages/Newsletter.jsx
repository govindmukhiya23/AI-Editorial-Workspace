import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Sparkles, 
  PenTool, 
  Copy, 
  Check, 
  Save, 
  RotateCcw, 
  Download, 
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import Header from '../components/Header';
import NewsletterCard from '../components/NewsletterCard';
import { researchApi } from '../services/researchService';
import { newsletterApi } from '../services/newsletterService';

export default function Newsletter() {
  const location = useLocation();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(location.state?.researchSessionId || '');
  const [selectedAngle, setSelectedAngle] = useState(location.state?.selectedAngle || '');
  const [newsletters, setNewsletters] = useState([]);

  const [currentNewsletterId, setCurrentNewsletterId] = useState(null);
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('draft');
  const [wordCount, setWordCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [resSessions, resNewsletters] = await Promise.all([
        researchApi.getSessions(),
        newsletterApi.getNewsletters()
      ]);

      const sessionList = resSessions.data || [];
      setSessions(sessionList);
      setNewsletters(resNewsletters.data || []);

      // If routed from Research with a session ID
      if (location.state?.researchSessionId) {
        setSelectedSessionId(location.state.researchSessionId);
        const match = sessionList.find(s => s._id === location.state.researchSessionId);
        if (match && location.state.selectedAngle) {
          setSelectedAngle(location.state.selectedAngle);
        } else if (match?.researchBrief?.newsletterAngles?.[0]) {
          setSelectedAngle(match.researchBrief.newsletterAngles[0].headline);
        }
      } else if (sessionList.length > 0 && !selectedSessionId) {
        setSelectedSessionId(sessionList[0]._id);
        if (sessionList[0].researchBrief?.newsletterAngles?.[0]) {
          setSelectedAngle(sessionList[0].researchBrief.newsletterAngles[0].headline);
        }
      }
    } catch (err) {
      console.error('Failed to load initial newsletter data:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentSession = sessions.find(s => s._id === selectedSessionId);
  const angles = currentSession?.researchBrief?.newsletterAngles || [];

  const handleSessionChange = (sId) => {
    setSelectedSessionId(sId);
    const chosen = sessions.find(s => s._id === sId);
    if (chosen?.researchBrief?.newsletterAngles?.[0]) {
      setSelectedAngle(chosen.researchBrief.newsletterAngles[0].headline);
    } else {
      setSelectedAngle('');
    }
  };

  const handleGenerate = async () => {
    if (!selectedSessionId) {
      setError('Please select a completed research session.');
      return;
    }

    try {
      setGenerating(true);
      setError('');
      setSuccessMessage('');

      const res = await newsletterApi.generateNewsletter({
        researchSessionId: selectedSessionId,
        selectedAngle
      });

      const nl = res.data;
      setCurrentNewsletterId(nl._id);
      setHeadline(nl.headline);
      setBody(nl.body);
      setStatus(nl.status || 'draft');
      setWordCount(nl.wordCount || nl.body.split(/\s+/).filter(Boolean).length);

      // Refresh list
      const updatedList = await newsletterApi.getNewsletters();
      setNewsletters(updatedList.data || []);

      setSuccessMessage('Newsletter draft generated! You can edit headline, body, or open in Writing Assistant.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to generate newsletter draft.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!currentNewsletterId) return;

    try {
      setSaving(true);
      const res = await newsletterApi.updateNewsletter(currentNewsletterId, {
        headline,
        body,
        status
      });
      const updated = res.data;
      setWordCount(updated.wordCount);
      setSuccessMessage('Newsletter saved successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);

      const updatedList = await newsletterApi.getNewsletters();
      setNewsletters(updatedList.data || []);
    } catch (err) {
      alert(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    if (currentNewsletterId) {
      await newsletterApi.updateStatus(currentNewsletterId, newStatus);
      const updatedList = await newsletterApi.getNewsletters();
      setNewsletters(updatedList.data || []);
    }
  };

  const handleCopy = () => {
    const fullText = `# ${headline}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = (format = 'md') => {
    const content = format === 'md' ? `# ${headline}\n\n${body}` : `${headline}\n\n${body}`;
    const mime = format === 'md' ? 'text/markdown' : 'text/plain';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${headline.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenInWriting = () => {
    navigate('/writing', {
      state: {
        initialText: body,
        initialTitle: headline,
        researchSessionId: selectedSessionId
      }
    });
  };

  const handleDeleteNewsletter = async (id) => {
    if (!window.confirm('Delete this newsletter?')) return;
    try {
      await newsletterApi.deleteNewsletter(id);
      setNewsletters(newsletters.filter(n => n._id !== id));
      if (currentNewsletterId === id) {
        setCurrentNewsletterId(null);
        setHeadline('');
        setBody('');
      }
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const currentWords = body.split(/\s+/).filter(Boolean).length;
  const isWordCountOptimal = currentWords >= 300 && currentWords <= 500;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16">
      <Header
        title="Newsletter Workspace"
        subtitle="Turn research briefs into high-signal newsletter articles (300–500 words) for founders and operators."
      />

      <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-8">
        {/* Messages */}
        {error && (
          <div className="flex items-center space-x-2 text-rose-700 bg-rose-50 border border-rose-200 p-4 rounded-xl text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center space-x-2 text-emerald-800 bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Top Control Bar: Research Session & Angle Selection */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Step 1: Select Verified Research & Angle</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Session selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Research Session
              </label>
              <select
                value={selectedSessionId}
                onChange={(e) => handleSessionChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {sessions.length === 0 ? (
                  <option value="">No completed research sessions found</option>
                ) : (
                  sessions.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.title} ({s.sources?.length || 0} sources)
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Angle selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Editorial Angle / Story Hook
              </label>
              <select
                value={selectedAngle}
                onChange={(e) => setSelectedAngle(e.target.value)}
                disabled={angles.length === 0}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:bg-slate-100 disabled:text-slate-400"
              >
                {angles.length === 0 ? (
                  <option value="">No angles available in selected session</option>
                ) : (
                  angles.map((a, idx) => (
                    <option key={a.id || idx} value={a.headline}>
                      {a.headline} ({a.targetAudience})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              {currentSession?.sources?.length || 0} verified sources will be referenced.
            </span>

            <button
              onClick={handleGenerate}
              disabled={generating || !selectedSessionId}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {generating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Drafting Newsletter with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Newsletter Draft</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Newsletter Editor */}
        {(headline || body) && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Action Bar */}
            <div className="px-6 py-4 bg-slate-50/60 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status:
                </span>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="draft">Draft</option>
                  <option value="under_review">Under Review</option>
                  <option value="finalized">Finalized</option>
                </select>

                <div
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1 ${
                    isWordCountOptimal
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <span>{currentWords} words</span>
                  {!isWordCountOptimal && (
                    <span className="text-[10px] font-normal">(Target: 300–500)</span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleOpenInWriting}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 text-xs font-semibold transition-colors"
                  title="Send to Hemingway-inspired Writing Assistant"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Open in Writing Assistant</span>
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save'}</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors"
                  title="Copy text"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => handleExport('md')}
                  className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors"
                  title="Export Markdown"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Editable Headline */}
            <div className="p-6 border-b border-slate-100">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full text-xl sm:text-2xl font-bold text-slate-900 border-0 focus:ring-0 p-0 focus:outline-none placeholder:text-slate-300 font-sans"
                placeholder="Newsletter Headline..."
              />
            </div>

            {/* Editable Content */}
            <div className="p-6">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Newsletter Article Body (Markdown supported)
              </label>
              <textarea
                rows={16}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full text-sm sm:text-base font-editorial leading-relaxed text-slate-800 border-0 focus:ring-0 p-0 focus:outline-none resize-none placeholder:text-slate-300"
                placeholder="Generated newsletter draft..."
              />
            </div>

            {/* Source References Footer */}
            {currentSession?.sources && currentSession.sources.length > 0 && (
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Backed by:</span>
                {currentSession.sources.map((s, idx) => (
                  <a
                    key={s._id || idx}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-indigo-600 hover:underline"
                  >
                    <span>{s.title || 'Source'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved Newsletters Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Saved Newsletters ({newsletters.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Drafted and finalized editorial articles stored in MongoDB.
              </p>
            </div>
          </div>

          {newsletters.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              No saved newsletters yet. Generate one using the panel above.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsletters.map((n) => (
                <NewsletterCard
                  key={n._id}
                  newsletter={n}
                  onDelete={handleDeleteNewsletter}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
