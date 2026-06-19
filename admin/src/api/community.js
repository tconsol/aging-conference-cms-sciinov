import api from './axios';

// Partners
export const partnersAPI = {
  getAll: () => api.get('/partners'),
  getOne: (id) => api.get(`/partners/${id}`),
  create: (data) => api.post('/partners', data),
  update: (id, data) => api.put(`/partners/${id}`, data),
  delete: (id) => api.delete(`/partners/${id}`),
};

// Testimonials
export const testimonialsAPI = {
  getAll: () => api.get('/testimonials'),
  getOne: (id) => api.get(`/testimonials/${id}`),
  create: (data) => api.post('/testimonials', data),
  update: (id, data) => api.put(`/testimonials/${id}`, data),
  delete: (id) => api.delete(`/testimonials/${id}`),
};

// Newsletter
export const newsletterAPI = {
  getAll: (params) => api.get('/newsletter', { params }),
  delete: (id) => api.delete(`/newsletter/${id}`),
  exportCSV: () => api.get('/newsletter/export/csv', { responseType: 'blob' }),
};
