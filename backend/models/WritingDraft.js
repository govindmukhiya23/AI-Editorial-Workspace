const mongoose = require('mongoose');
const memoryStores = require('../config/memoryStore');

const SuggestionSchema = new mongoose.Schema({
  issueType: {
    type: String,
    enum: ['long_sentence', 'passive_voice', 'jargon', 'filler_words', 'repetition', 'clarity'],
    required: true
  },
  originalText: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  suggestedText: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
});

const WritingMetricsSchema = new mongoose.Schema({
  wordCount: { type: Number, default: 0 },
  sentenceCount: { type: Number, default: 0 },
  averageSentenceLength: { type: Number, default: 0 },
  readingTime: { type: Number, default: 0 },
  readabilityScore: { type: Number, default: 0 },
  readingLevel: { type: String, default: 'Standard' }
}, { _id: false });

const WritingDraftSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Untitled Draft',
    trim: true
  },
  researchSessionId: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'ResearchSession',
    default: null
  },
  originalText: {
    type: String,
    required: true
  },
  revisedText: {
    type: String,
    required: true
  },
  suggestions: [SuggestionSchema],
  metrics: {
    type: WritingMetricsSchema,
    default: () => ({})
  }
}, {
  timestamps: true
});

WritingDraftSchema.index({ updatedAt: -1 });

const MongooseModel = mongoose.model('WritingDraft', WritingDraftSchema);

module.exports = new Proxy(MongooseModel, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    const mem = memoryStores.WritingDraft;
    if (mem && typeof mem[prop] !== 'undefined') {
      return typeof mem[prop] === 'function' ? mem[prop].bind(mem) : mem[prop];
    }
    return target[prop];
  }
});
