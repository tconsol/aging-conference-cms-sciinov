import api from './axios';

// Pricing Tiers
export const pricingAPI = {
  getAll: (params) => api.get('/pricing', { params }),
  getOne: (id) => api.get(`/pricing/${id}`),
  create: (data) => api.post('/pricing', data),
  update: (id, data) => api.put(`/pricing/${id}`, data),
  delete: (id) => api.delete(`/pricing/${id}`),
};

// Sponsorship / exhibitor / other packages shown on the public sponsorship page
export const packagesAPI = {
  getAll: (params) => api.get('/packages', { params }),
  getCategories: () => api.get('/packages/categories'),
  getOne: (id) => api.get(`/packages/${id}`),
  create: (data) => api.post('/packages', data),
  update: (id, data) => api.patch(`/packages/${id}`, data),
  delete: (id) => api.delete(`/packages/${id}`),
};

// Sponsorship Inquiries
export const sponsorshipAPI = {
  getAll: (params) => api.get('/sponsorship', { params }),
  getOne: (id) => api.get(`/sponsorship/${id}`),
  updateStatus: (id, status) => api.patch(`/sponsorship/${id}/status`, { status }),
  delete: (id) => api.delete(`/sponsorship/${id}`),
};
