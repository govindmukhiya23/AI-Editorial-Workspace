import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  HelpCircle, 
  Sparkles, 
  Users, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import EvidenceCard from './EvidenceCard';

export default function ResearchBrief({ session, sources }) {
  const navigate = useNavigate();
  const brief = session.researchBrief;

  if (!brief) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        No research brief generated yet for this session.
      </div>
    );
  }

  const handleAngleSelect = (angle) => {
    // Navigate to Newsletter Workspace passing session ID and chosen angle
    navigate('/newsletter', {
      state: {
        researchSessionId: session._id,
        selectedAngle: angle.headline
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. Research Overview */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center space-x-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Section 1 • Research Overview</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-3">
          {session.title}
        </h2>
        <div className="flex items-center space-x-4 text-xs text-slate-500 mb-5">
          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium">
            {sources?.length || 0} Sources Processed
          </span>
          <span>Synthesized for Editorial Team</span>
        </div>
        <p className="text-slate-700 font-editorial text-base sm:text-lg leading-relaxed">
          {brief.overview}
        </p>
      </section>

      {/* 2. What Happened? */}
      {brief.keyDevelopments && brief.keyDevelopments.length > 0 && (
        <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center space-x-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-4">
            <Layers className="w-4 h-4" />
            <span>Section 2 • What Happened?</span>
          </div>
          <div className="space-y-4">
            {brief.keyDevelopments.map((dev, idx) => (
              <div key={idx} className="p-5 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold text-slate-900 text-base">{dev.title}</h3>
                  {dev.date && (
                    <span className="text-xs text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                      {dev.date}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{dev.description}</p>
                {dev.organizations && dev.organizations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {dev.organizations.map((org, oIdx) => (
                      <span key={oIdx} className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium">
                        {org}
                      </span>
                    ))}
                  </div>
                )}
                {dev.changes && (
                  <p className="text-xs text-slate-500 pt-1">
                    <span className="font-medium text-slate-700">Technical Shift:</span> {dev.changes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Why Does It Matter? */}
      {brief.whyItMatters && brief.whyItMatters.length > 0 && (
        <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center space-x-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-4">
            <TrendingUp className="w-4 h-4" />
            <span>Section 3 • Why Does It Matter?</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {brief.whyItMatters.map((point, idx) => (
              <div key={idx} className="p-5 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                  {point.category || 'Strategic Implication'}
                </span>
                <h4 className="font-semibold text-slate-900 text-sm">{point.point}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{point.impact}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Who Should Care? */}
      {brief.audience && brief.audience.length > 0 && (
        <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center space-x-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-4">
            <Users className="w-4 h-4" />
            <span>Section 4 • Who Should Care?</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {brief.audience.map((aud, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="font-semibold text-slate-900 text-sm flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
                  <span>{aud.target}</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">{aud.reason}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Supporting Evidence */}
      {brief.evidence && brief.evidence.length > 0 && (
        <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Section 5 • Supporting Evidence</span>
            </div>
            <span className="text-xs text-slate-500">{brief.evidence.length} claims verified</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {brief.evidence.map((ev, idx) => (
              <EvidenceCard key={idx} evidence={ev} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Facts, Analysis and Speculation */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center space-x-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-4">
          <HelpCircle className="w-4 h-4" />
          <span>Section 6 • Facts, Analysis & Speculation</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Verified Facts */}
          <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>Verified Facts</span>
            </div>
            <p className="text-[11px] text-emerald-700">Explicitly verified from sources.</p>
            <ul className="space-y-2 text-xs text-emerald-950 font-medium">
              {(brief.facts || []).map((fact, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Editorial Analysis */}
          <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
            <div className="flex items-center space-x-2 text-blue-800 font-bold text-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              <span>Reasoned Analysis</span>
            </div>
            <p className="text-[11px] text-blue-700">Synthesized editorial reasoning.</p>
            <ul className="space-y-2 text-xs text-blue-950 font-medium">
              {(brief.analysis || []).map((an, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>{an}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Forward Speculation */}
          <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3">
            <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              <span>Speculation / Outlook</span>
            </div>
            <p className="text-[11px] text-amber-700">Unverified future projections.</p>
            <ul className="space-y-2 text-xs text-amber-950 font-medium">
              {(brief.speculation || []).map((sp, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{sp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 7. Newsletter Opportunities */}
      {brief.newsletterAngles && brief.newsletterAngles.length > 0 && (
        <section className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-6 sm:p-8 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-indigo-300 font-semibold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Section 7 • Newsletter Opportunities</span>
            </div>
            <span className="text-xs text-indigo-200">
              {brief.newsletterAngles.length} Angle{brief.newsletterAngles.length > 1 ? 's' : ''} Identified
            </span>
          </div>

          <div className="space-y-4">
            {brief.newsletterAngles.map((angle, idx) => (
              <div
                key={angle.id || idx}
                className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-2 max-w-2xl">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded">
                    Target: {angle.targetAudience}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {angle.headline}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-editorial">
                    {angle.centralStory}
                  </p>
                  {angle.whyItMatters && (
                    <p className="text-xs text-indigo-200">
                      <span className="font-semibold text-white">Why readers care:</span> {angle.whyItMatters}
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => handleAngleSelect(angle)}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md hover:shadow-indigo-500/25 cursor-pointer"
                  >
                    <span>Write Newsletter</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. Source References */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center space-x-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-4">
          <FileText className="w-4 h-4" />
          <span>Section 8 • Source References</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Publisher</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(sources || []).map((s, idx) => (
                <tr key={s._id || idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-medium text-slate-900">{s.title || 'Untitled'}</td>
                  <td className="py-3 px-3">{s.publisher || 'Unknown'}</td>
                  <td className="py-3 px-3">
                    <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {s.extractionStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {s.url && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 inline-flex items-center space-x-1"
                      >
                        <span>Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

