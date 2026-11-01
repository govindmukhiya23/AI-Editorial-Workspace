import api from './api';

export const researchApi = {
  getSessions: () => api.get('/research'),
  getSession: (id) => api.get(`/research/${id}`),
  createSession: (title) => api.post('/research', { title }),
  deleteSession: (id) => api.delete(`/research/${id}`),
  addSources: (sessionId, sources) => api.post(`/research/${sessionId}/sources`, { sources }),
  analyzeSession: (sessionId) => api.post(`/research/${sessionId}/analyze`),
  extractStandalone: (url) => api.post('/research/extract', { url }),
  extractSource: (sourceId) => api.post(`/research/sources/${sourceId}/extract`),
  updateManualSource: (sourceId, data) => api.put(`/research/sources/${sourceId}/manual`, data)
};
