/**
 * In-memory fallback store for zero-config evaluation when MongoDB Atlas is not yet configured.
 * Automatically wraps Mongoose models so the full application works seamlessly out-of-the-box.
 */

class MemoryCollection {
  constructor(name) {
    this.name = name;
    this.docs = [];
    this.counter = 1;
  }

  generateId() {
    return `${this.name.toLowerCase().slice(0, 3)}_${Date.now()}_${this.counter++}`;
  }

  createDoc(data) {
    const doc = {
      _id: data._id || this.generateId(),
      ...JSON.parse(JSON.stringify(data)),
      createdAt: data.createdAt || new Date(),
      updatedAt: new Date()
    };

    // Add Mongoose-like save method
    doc.save = async () => {
      doc.updatedAt = new Date();
      const idx = this.docs.findIndex(d => String(d._id) === String(doc._id));
      if (idx !== -1) {
        this.docs[idx] = doc;
      }
      return doc;
    };

    // Add helper for array subdocument access e.g. draft.suggestions.id(sId)
    if (doc.suggestions && Array.isArray(doc.suggestions)) {
      doc.suggestions.id = (subId) => doc.suggestions.find(s => String(s._id || s.id) === String(subId));
      doc.suggestions.forEach(s => {
        if (!s._id) s._id = `sug_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      });
    }

    return doc;
  }

  async create(data) {
    const doc = this.createDoc(data);
    this.docs.push(doc);
    return doc;
  }

  find(filter = {}) {
    let result = [...this.docs];
    if (filter.researchSessionId) {
      result = result.filter(d => String(d.researchSessionId) === String(filter.researchSessionId));
    }

    const queryObj = {
      _result: result,
      populate: function(field) {
        // Simple mock populate
        if (field === 'sources' && global.__memoryStores?.Source) {
          this._result = this._result.map(d => {
            const copy = { ...d };
            if (Array.isArray(copy.sources)) {
              copy.sources = copy.sources.map(sId => {
                if (typeof sId === 'object') return sId;
                return global.__memoryStores.Source.docs.find(s => String(s._id) === String(sId)) || sId;
              });
            }
            return copy;
          });
        }
        return this;
      },
      sort: function() {
        return this._result.reverse();
      },
      then: function(resolve, reject) {
        return Promise.resolve(this._result).then(resolve, reject);
      }
    };

    return queryObj;
  }

  async findOne(filter = {}) {
    const match = this.docs.find(d => {
      for (const key of Object.keys(filter)) {
        if (String(d[key]) !== String(filter[key])) return false;
      }
      return true;
    });
    return match ? this.createDoc(match) : null;
  }

  findById(id) {
    const strId = String(id);
    const match = this.docs.find(d => String(d._id) === strId);
    let resolved = match ? this.createDoc(match) : null;

    const queryObj = {
      _result: resolved,
      populate: function(field) {
        if (this._result && field === 'sources' && global.__memoryStores?.Source) {
          const sIds = this._result.sources || [];
          this._result.sources = sIds.map(sId => {
            if (typeof sId === 'object') return sId;
            return global.__memoryStores.Source.docs.find(s => String(s._id) === String(sId)) || sId;
          });
        }
        return this;
      },
      then: function(resolve, reject) {
        return Promise.resolve(this._result).then(resolve, reject);
      }
    };

    return queryObj;
  }

  async findByIdAndUpdate(id, update, opts = {}) {
    const strId = String(id);
    const idx = this.docs.findIndex(d => String(d._id) === strId);
    if (idx === -1) return null;

    if (update.$addToSet) {
      for (const field of Object.keys(update.$addToSet)) {
        const setVal = update.$addToSet[field];
        if (!Array.isArray(this.docs[idx][field])) this.docs[idx][field] = [];
        if (setVal.$each) {
          for (const item of setVal.$each) {
            if (!this.docs[idx][field].some(existing => String(existing) === String(item))) {
              this.docs[idx][field].push(item);
            }
          }
        }
      }
    } else {
      this.docs[idx] = { ...this.docs[idx], ...update, updatedAt: new Date() };
    }

    return this.createDoc(this.docs[idx]);
  }

  async findByIdAndDelete(id) {
    const strId = String(id);
    const idx = this.docs.findIndex(d => String(d._id) === strId);
    if (idx !== -1) {
      const removed = this.docs.splice(idx, 1)[0];
      return removed;
    }
    return null;
  }

  async deleteMany(filter = {}) {
    if (filter.researchSessionId) {
      this.docs = this.docs.filter(d => String(d.researchSessionId) !== String(filter.researchSessionId));
    } else {
      this.docs = [];
    }
    return { deletedCount: 1 };
  }

  async countDocuments() {
    return this.docs.length;
  }
}

global.__memoryStores = {
  ResearchSession: new MemoryCollection('ResearchSession'),
  Source: new MemoryCollection('Source'),
  WritingDraft: new MemoryCollection('WritingDraft'),
  Newsletter: new MemoryCollection('Newsletter')
};

module.exports = global.__memoryStores;
