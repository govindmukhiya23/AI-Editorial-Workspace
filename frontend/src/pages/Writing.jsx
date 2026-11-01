import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  CheckCircle2, 
  Columns, 
  FileEdit, 
  AlertCircle, 
  FolderOpen,
  Filter
} from 'lucide-react';
import Header from '../components/Header';
import DraftEditor from '../components/DraftEditor';
import WritingMetrics from '../components/WritingMetrics';
import SuggestionCard from '../components/SuggestionCard';
import ComparisonView from '../components/ComparisonView';
import { writingApi } from '../services/writingService';

export default function Writing() {
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'compare'
  const [draftId, setDraftId] = useState(null);
  const [title, setTitle] = useState('AI Newsletter Draft');
  const [text, setText] = useState('');
  const [revisedText, setRevisedText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle incoming draft from Newsletter Workspace
  useEffect(() => {
    if (location.state?.initialText) {
      setText(location.state.initialText);
      setRevisedText(location.state.initialText);
      if (location.state.initialTitle) {
        setTitle(location.state.initialTitle);
      }
    } else {
      // Sample starter text demonstrating all 5 Hemingway checks for immediate testing
      setText(
        `The unprecedented development of artificial intelligence technologies has created many substantial opportunities for businesses that are actively looking in order to improve their operational efficiency across various critical enterprise workflows.\n\nBasically, the novel language model was developed by the research engineering team to achieve lower inference costs. It is important to note that the system uses 4-bit quantization and aggressive pruning techniques. Quantization is used by the system to reduce memory footprint.\n\nAt the end of the day, actually, repetitive data pipelines often duplicate identical explanations across paragraphs, which ultimately weakens the clarity of newsletter content.`
      );
      setRevisedText(
        `The unprecedented development of artificial intelligence technologies has created many substantial opportunities for businesses that are actively looking in order to improve their operational efficiency across various critical enterprise workflows.\n\nBasically, the novel language model was developed by the research engineering team to achieve lower inference costs. It is important to note that the system uses 4-bit quantization and aggressive pruning techniques. Quantization is used by the system to reduce memory footprint.\n\nAt the end of the day, actually, repetitive data pipelines often duplicate identical explanations across paragraphs, which ultimately weakens the clarity of newsletter content.`
      );
    }
  }, [location.state]);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please provide text to analyze.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError('');
      setSuccessMessage('');

      const res = await writingApi.analyzeDraft({
        text,
        title,
        draftId: draftId || undefined
      });

      const draft = res.data;
      setDraftId(draft._id);
      setRevisedText(draft.revisedText);
      setSuggestions(draft.suggestions || []);
      setMetrics(draft.metrics);
      setSuccessMessage('Writing analysis complete! Review suggestions on the right.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to analyze draft.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSuggestionAction = async (suggestionId, status) => {
    if (!draftId) return;

    try {
      const res = await writingApi.updateSuggestion(draftId, suggestionId, status);
      const updatedDraft = res.data;
      setSuggestions(updatedDraft.suggestions || []);
      setRevisedText(updatedDraft.revisedText);
      setMetrics(updatedDraft.metrics);
    } catch (err) {
      alert(`Could not update suggestion: ${err.message}`);
    }
  };

  const handleSaveDraft = async () => {
    if (!draftId) {
      handleAnalyze();
      return;
    }

    try {
      setIsSaving(true);
      await writingApi.updateDraft(draftId, {
        title,
        revisedText
      });
      setSuccessMessage('Draft saved successfully to MongoDB.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear current draft content?')) {
      setText('');
      setRevisedText('');
      setSuggestions([]);
      setMetrics(null);
      setDraftId(null);
    }
  };

  // Filter suggestions by selected category
  const filteredSuggestions = suggestions.filter(s => {
    if (selectedCategory === 'all') return true;
    return s.issueType === selectedCategory;
  });

  const categories = [
    { id: 'all', label: 'All Issues', count: suggestions.length },
    { id: 'long_sentence', label: 'Long Sentences', count: suggestions.filter(s => s.issueType === 'long_sentence').length },
    { id: 'passive_voice', label: 'Passive Voice', count: suggestions.filter(s => s.issueType === 'passive_voice').length },
    { id: 'jargon', label: 'Jargon', count: suggestions.filter(s => s.issueType === 'jargon').length },
    { id: 'filler_words', label: 'Filler Words', count: suggestions.filter(s => s.issueType === 'filler_words').length },
    { id: 'repetition', label: 'Repetition', count: suggestions.filter(s => s.issueType === 'repetition').length },
  ];

  const pendingCount = suggestions.filter(s => s.status === 'pending').length;
  const acceptedCount = suggestions.filter(s => s.status === 'accepted').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16">
      <Header
        title="Writing Assistant"
        subtitle="Hemingway-inspired editorial review: simplify complex sentences, eliminate passive voice, and polish tone."
        actions={
          <div className="flex items-center space-x-2 bg-slate-200/60 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'editor' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Editor & Suggestions</span>
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'compare' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Compare Versions ({acceptedCount} applied)</span>
            </button>
          </div>
        }
      />

      <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-6">
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

        {/* Deterministic Metrics Bar */}
        <WritingMetrics
          metrics={
            metrics || {
              wordCount: text.split(/\s+/).filter(Boolean).length,
              averageSentenceLength: 0,
              readingTime: Math.ceil(text.split(/\s+/).filter(Boolean).length / 200) || 1,
              readabilityScore: 100,
              readingLevel: 'Draft'
            }
          }
        />

        {activeTab === 'editor' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Draft Editor */}
            <div className="lg:col-span-7">
              <DraftEditor
                title={title}
                onTitleChange={setTitle}
                text={text}
                onChange={setText}
                onAnalyze={handleAnalyze}
                onClear={handleClear}
                onSave={handleSaveDraft}
                isAnalyzing={isAnalyzing}
                isSaving={isSaving}
                wordCount={text.split(/\s+/).filter(Boolean).length}
              />
            </div>

            {/* Right Column: Writing Feedback & Suggestions */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Editorial Suggestions ({suggestions.length})
                    </h3>
                  </div>
                  {pendingCount > 0 && (
                    <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      {pendingCount} Pending
                    </span>
                  )}
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label} ({cat.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggestions List */}
              {suggestions.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs space-y-2">
                  <Sparkles className="w-6 h-6 text-slate-300 mx-auto" />
                  <p className="font-medium text-slate-600">No issues identified yet.</p>
                  <p>Click "Analyze Draft" to scan for long sentences, passive voice, jargon, and filler words.</p>
                </div>
              ) : filteredSuggestions.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-400 text-xs">
                  No issues found in the selected category.
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[700px] overflow-y-auto pr-1">
                  {filteredSuggestions.map((s) => (
                    <SuggestionCard
                      key={s._id}
                      suggestion={s}
                      onAccept={(sId) => handleSuggestionAction(sId, 'accepted')}
                      onReject={(sId) => handleSuggestionAction(sId, 'rejected')}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Tab 2: Compare Original vs Revised Draft */
          <ComparisonView
            originalText={text}
            revisedText={revisedText}
            suggestions={suggestions}
          />
        )}
      </main>
    </div>
  );
}
