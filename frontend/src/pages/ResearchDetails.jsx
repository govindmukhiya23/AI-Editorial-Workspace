import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  Plus, 
  FileText,
  Clock
} from 'lucide-react';
import Header from '../components/Header';
import SourceCard from '../components/SourceCard';
import ResearchBrief from '../components/ResearchBrief';
import { researchApi } from '../services/researchService';

export default function ResearchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSession();
  }, [id]);

  const loadSession = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await researchApi.getSession(id);
      setSession(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load research session.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryExtraction = async (sourceId) => {
    try {
      await researchApi.extractSource(sourceId);
      loadSession();
    } catch (err) {
      alert(`Retry failed: ${err.message}`);
    }
  };

  const handleManualSubmit = async (sourceId, data) => {
    try {
      await researchApi.updateManualSource(sourceId, data);
      loadSession();
    } catch (err) {
      alert(`Failed to save manual content: ${err.message}`);
    }
  };

  const handleReanalyze = async () => {
    try {
      setAnalyzing(true);
      setError('');
      const res = await researchApi.analyzeSession(id);
      setSession(res.data);
    } catch (err) {
      setError(err.message || 'Failed to synthesize brief.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-slate-500 text-sm">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading research session...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="text-rose-600 font-semibold text-lg">Session Not Found</div>
        <p className="text-slate-500 text-sm">{error || 'The requested research session could not be located.'}</p>
        <button
          onClick={() => navigate('/research')}
          className="inline-flex items-center space-x-2 text-indigo-600 text-sm font-semibold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Research</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16">
      <Header
        title={session.title}
        subtitle="Comprehensive evidence extraction and collective editorial synthesis."
        actions={
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/research')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Research</span>
            </button>

            <button
              onClick={handleReanalyze}
              disabled={analyzing}
              className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {analyzing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Re-synthesize Brief</span>
                </>
              )}
            </button>
          </div>
        }
      />

      <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-8">
        {error && (
          <div className="flex items-center space-x-2 text-rose-700 bg-rose-50 border border-rose-200 p-4 rounded-xl text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Sources Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Submitted Sources ({session.sources?.length || 0})
            </h2>
            <span className="text-xs text-slate-400">
              Extraction engine: Mozilla Readability + Cheerio Fallback
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {session.sources?.map((source, idx) => (
              <SourceCard
                key={source._id || idx}
                source={source}
                index={idx}
                onRetry={handleRetryExtraction}
                onManualSubmit={handleManualSubmit}
              />
            ))}
          </div>
        </div>

        {/* Generated Research Brief (All 8 PRD Sections) */}
        {session.researchBrief ? (
          <ResearchBrief session={session} sources={session.sources} />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
            <Sparkles className="w-8 h-8 text-indigo-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Brief Not Yet Generated</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Click the "Re-synthesize Brief" button above to extract all sources collectively and generate the evidence-backed brief.
            </p>
            <button
              onClick={handleReanalyze}
              disabled={analyzing}
              className="inline-flex items-center space-x-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
            >
              <span>Generate Brief</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

