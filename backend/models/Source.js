const mongoose = require('mongoose');
const memoryStores = require('../config/memoryStore');

const SourceSchema = new mongoose.Schema({
  researchSessionId: {
    type: mongoose.Schema.Types.Mixed,
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

const MongooseModel = mongoose.model('Source', SourceSchema);

module.exports = new Proxy(MongooseModel, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    const mem = memoryStores.Source;
    if (mem && typeof mem[prop] !== 'undefined') {
      return typeof mem[prop] === 'function' ? mem[prop].bind(mem) : mem[prop];
    }
    return target[prop];
  }
});
