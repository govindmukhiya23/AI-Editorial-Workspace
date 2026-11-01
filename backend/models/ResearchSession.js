const mongoose = require('mongoose');

const KeyDevelopmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String },
  organizations: [{ type: String }],
  changes: { type: String }
}, { _id: false });

const WhyItMattersSchema = new mongoose.Schema({
  point: { type: String, required: true },
  category: { type: String },
  impact: { type: String }
}, { _id: false });

const AudienceSchema = new mongoose.Schema({
  target: { type: String, required: true }, // e.g. Founders, Developers, Operators, Leaders
  reason: { type: String, required: true }
}, { _id: false });

const EvidenceSchema = new mongoose.Schema({
  claim: { type: String, required: true },
  sourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Source' },
  sourceTitle: { type: String },
  sourceUrl: { type: String },
  excerpt: { type: String },
  status: {
    type: String,
    enum: ['supported', 'partially_supported', 'unsupported', 'conflicting_evidence'],
    default: 'supported'
  }
}, { _id: false });

const NewsletterAngleSchema = new mongoose.Schema({
  id: { type: String },
  headline: { type: String, required: true },
  centralStory: { type: String, required: true },
  whyItMatters: { type: String, required: true },
  targetAudience: { type: String, required: true },
  practicalImplications: { type: String },
  supportingSources: [{ type: String }]
}, { _id: false });

const ResearchBriefSchema = new mongoose.Schema({
  overview: { type: String },
  keyDevelopments: [KeyDevelopmentSchema],
  whyItMatters: [WhyItMattersSchema],
  audience: [AudienceSchema],
  evidence: [EvidenceSchema],
  facts: [{ type: String }],
  analysis: [{ type: String }],
  speculation: [{ type: String }],
  newsletterAngles: [NewsletterAngleSchema]
}, { _id: false });

const ResearchSessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  sources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Source'
  }],
  researchBrief: {
    type: ResearchBriefSchema,
    default: null
  },
  status: {
    type: String,
    enum: ['created', 'processing', 'completed', 'failed'],
    default: 'created'
  },
  errorMessage: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

ResearchSessionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ResearchSession', ResearchSessionSchema);
