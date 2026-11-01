const mongoose = require('mongoose');
const memoryStores = require('../config/memoryStore');

const NewsletterSchema = new mongoose.Schema({
  researchSessionId: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'ResearchSession',
    default: null
  },
  writingDraftId: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'WritingDraft',
    default: null
  },
  title: {
    type: String,
    default: 'AI Newsletter',
    trim: true
  },
  headline: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  selectedAngle: {
    type: String,
    default: ''
  },
  sources: [{
    type: mongoose.Schema.Types.Mixed,
    ref: 'Source'
  }],
  originalDraft: {
    type: String,
    default: ''
  },
  revisedDraft: {
    type: String,
    default: ''
  },
  wordCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'under_review', 'finalized'],
    default: 'draft'
  }
}, {
  timestamps: true
});

NewsletterSchema.index({ researchSessionId: 1 });
NewsletterSchema.index({ createdAt: -1 });

const MongooseModel = mongoose.model('Newsletter', NewsletterSchema);

module.exports = new Proxy(MongooseModel, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    const mem = memoryStores.Newsletter;
    if (mem && typeof mem[prop] !== 'undefined') {
      return typeof mem[prop] === 'function' ? mem[prop].bind(mem) : mem[prop];
    }
    return target[prop];
  }
});
