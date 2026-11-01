import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Trash2, 
  ExternalLink, 
  FileText, 
  AlertCircle,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import Header from '../components/Header';
import SourceInput from '../components/SourceInput';
import { researchApi } from '../services/researchService';

export default function Research() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sources, setSources] = useState([
    { id: '1', type: 'url', url: '', title: '', manualContent: '', publisher: '' },
    { id: '2', type: 'url', url: '', title: '', manualContent: '', publisher: '' },
    { id: '3', type: 'url', url: '', title: '', manualContent: '', publisher: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const res = await researchApi.getSessions();
      setSessions(res.data || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndAnalyze = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      // 1. Create Session
      const sessionRes = await researchApi.createSession(sessionTitle.trim());
      const sessionId = sessionRes.data.id;

      // 2. Add Sources
      const formattedSources = sources.map(s => {
        if (s.type === 'manual') {
          return {
            manualContent: s.manualContent,
            title: s.title || 'Manual Article',
            publisher: s.publisher || 'User Provided'
          };
        }
        return {
          url: s.url.trim(),
          title: s.title.trim() || undefined,
          publisher: s.publisher.trim() || undefined
        };
      });

      await researchApi.addSources(sessionId, formattedSources);

      // 3. Trigger Extraction & AI Synthesis
      await researchApi.analyzeSession(sessionId);

      // 4. Navigate directly to Session details
      navigate(`/research/${sessionId}`);
    } catch (err) {
      setError(err.message || 'Failed to generate research brief.');
      setIsSubmitting(false);
    }
  };

  const handleDeleteSession = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this research session and all associated sources?')) return;
    try {
      await researchApi.deleteSession(id);
      setSessions(sessions.filter(s => s._id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        title="Research Assistant"
        subtitle="Submit 3+ sources to extract, verify facts, and produce an evidence-backed editorial brief."
      />

      <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-8">
        {/* New Session Creation Form */}
        <SourceInput
          sessionTitle={sessionTitle}
          onTitleChange={setSessionTitle}
          sources={sources}
          onChange={setSources}
          onSubmit={handleCreateAndAnalyze}
          isSubmitting={isSubmitting}
        />

        {error && (
          <div className="flex items-center space-x-2 text-rose-700 bg-rose-50 border border-rose-200 p-4 rounded-xl text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Previous Research Sessions History */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Research Sessions History
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Saved editorial briefs stored persistently in MongoDB.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading research history...</div>
          ) : sessions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No research sessions created yet. Enter 3 sources above to generate your first brief.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((s) => (
                <div
                  key={s._id}
                  onClick={() => navigate(`/research/${s._id}`)}
                  className="p-5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors">
                        {s.title}
                      </h3>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize shrink-0 ${
                          s.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.status === 'processing'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 font-editorial mb-3">
                      {s.researchBrief?.overview || 'No brief summary available.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                    <span>{s.sources?.length || 0} sources</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => handleDeleteSession(e, s._id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-indigo-600 font-semibold inline-flex items-center space-x-1">
                        <span>View Brief</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
