import api from './api';

export const newsletterApi = {
  getNewsletters: () => api.get('/newsletter'),
  getNewsletter: (id) => api.get(`/newsletter/${id}`),
  generateNewsletter: (data) => api.post('/newsletter/generate', data),
  updateNewsletter: (id, data) => api.put(`/newsletter/${id}`, data),
  updateStatus: (id, status) => api.patch(`/newsletter/${id}/status`, { status }),
  deleteNewsletter: (id) => api.delete(`/newsletter/${id}`)
};

