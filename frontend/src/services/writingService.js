import api from './api';

export const writingApi = {
  getDrafts: () => api.get('/writing'),
  getDraft: (id) => api.get(`/writing/${id}`),
  analyzeDraft: (data) => api.post('/writing/analyze', data),
  updateDraft: (id, data) => api.put(`/writing/${id}`, data),
  updateSuggestion: (draftId, suggestionId, status) =>
    api.patch(`/writing/${draftId}/suggestions/${suggestionId}`, { status }),
  getComparison: (draftId) => api.get(`/writing/${draftId}/compare`),
  deleteDraft: (id) => api.delete(`/writing/${id}`)
};
