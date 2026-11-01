import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  PenTool, 
  FileText, 
  ArrowRight, 
  Sparkles, 
  Database, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Header from '../components/Header';
import { researchApi } from '../services/researchService';
import { newsletterApi } from '../services/newsletterService';
import { writingApi } from '../services/writingService';

export default function Dashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [newsletters, setNewsletters] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [resSessions, resNewsletters, resDrafts] = await Promise.allSettled([
        researchApi.getSessions(),
        newsletterApi.getNewsletters(),
        writingApi.getDrafts()
      ]);

      if (resSessions.status === 'fulfilled') setSessions(resSessions.value.data || []);
      if (resNewsletters.status === 'fulfilled') setNewsletters(resNewsletters.value.data || []);
      if (resDrafts.status === 'fulfilled') setDrafts(resDrafts.value.data || []);
    } catch (err) {
      console.error('Failed loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        title="Editorial Dashboard"
        subtitle="Transform raw industry sources into evidence-backed research and polished newsletter content."
      />

      <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-8">
        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Research Assistant */}
          <div
            onClick={() => navigate('/research')}
            className="group bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Research Assistant
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Ingest 3+ articles or papers, verify claims against sources, and generate structured briefs.
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-semibold text-indigo-600 space-x-1">
              <span>Start Research Session</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Writing Assistant */}
          <div
            onClick={() => navigate('/writing')}
            className="group bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <PenTool className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                Writing Assistant
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Hemingway-inspired clarity checks, passive voice removal, jargon explanations, and 1-click rewrites.
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-semibold text-purple-600 space-x-1">
              <span>Open Writing Editor</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Newsletter Workspace */}
          <div
            onClick={() => navigate('/newsletter')}
            className="group bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Newsletter Workspace
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Convert verified research angles into 300–500 word articles tailored for founders and builders.
              </p>
            </div>
            <div className="mt-5 flex items-center text-xs font-semibold text-emerald-600 space-x-1">
              <span>Draft Newsletter</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Research Sessions</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{sessions.length}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Newsletters Created</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{newsletters.length}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Drafts Analyzed</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{drafts.length}</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Database Persistence</span>
            <div className="text-xs font-semibold text-emerald-600 mt-2 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>MongoDB Active</span>
            </div>
          </div>
        </div>

        {/* Recent Work Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Research Sessions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Recent Research Sessions
              </h2>
              <button
                onClick={() => navigate('/research')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View all
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading research sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No research sessions yet. Click "Start Research Session" above to begin.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sessions.slice(0, 4).map((s) => (
                  <div
                    key={s._id}
                    onClick={() => navigate(`/research/${s._id}`)}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 truncate max-w-xs sm:max-w-md">
                        {s.title}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {s.sources?.length || 0} sources • {new Date(s.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
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
                ))}
              </div>
            )}
          </div>

          {/* Recent Newsletters */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Recent Newsletters
              </h2>
              <button
                onClick={() => navigate('/newsletter')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View all
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading newsletters...</div>
            ) : newsletters.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No newsletters generated yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {newsletters.slice(0, 4).map((n) => (
                  <div
                    key={n._id}
                    onClick={() => navigate('/newsletter')}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 truncate max-w-xs sm:max-w-md">
                        {n.headline}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {n.wordCount || 0} words • {n.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

