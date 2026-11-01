const mongoose = require('mongoose');

const NewsletterSchema = new mongoose.Schema({
  researchSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResearchSession',
    default: null
  },
  writingDraftId: {
    type: mongoose.Schema.Types.ObjectId,
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
    type: mongoose.Schema.Types.ObjectId,
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

module.exports = mongoose.model('Newsletter', NewsletterSchema);
