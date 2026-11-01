const mongoose = require('mongoose');

const SourceSchema = new mongoose.Schema({
  researchSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResearchSession',
    required: true,
    index: true
  },
  url: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    default: 'Untitled Source'
  },
  publisher: {
    type: String,
    default: 'Unknown Publisher'
  },
  extractedContent: {
    type: String,
    default: ''
  },
  extractionStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'manual_input'],
    default: 'pending'
  },
  errorMessage: {
    type: String,
    default: null
  },
  contentHash: {
    type: String
  }
}, {
  timestamps: true
});

SourceSchema.index({ researchSessionId: 1, url: 1 });

module.exports = mongoose.model('Source', SourceSchema);
