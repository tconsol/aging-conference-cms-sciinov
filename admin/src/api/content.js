import api from './axios';

// News / Blog
export const newsAPI = {
  getAll: (params) => api.get('/news', { params }),
  getOne: (id) => api.get(`/news/admin/${id}`),
  create: (data) => api.post('/news', data),
  update: (id, data) => api.put(`/news/${id}`, data),
  delete: (id) => api.delete(`/news/${id}`),
};

// Reports
export const reportsAPI = {
  getAll: () => api.get('/reports'),
  getOne: (id) => api.get(`/reports/${id}`),
  create: (data) => api.post('/reports', data),
  update: (id, data) => api.put(`/reports/${id}`, data),
  delete: (id) => api.delete(`/reports/${id}`),
};

// Downloads
export const downloadsAPI = {
  getAll: () => api.get('/downloads'),
  getOne: (id) => api.get(`/downloads/${id}`),
  create: (data) => api.post('/downloads', data),
  update: (id, data) => api.put(`/downloads/${id}`, data),
  delete: (id) => api.delete(`/downloads/${id}`),
};

// Brochure
export const brochureAPI = {
  getAll: () => api.get('/brochure'),
  upload: (data) => api.post('/brochure', data),
  delete: (id) => api.delete(`/brochure/${id}`),
};

// Static Pages (guidelines, publication, terms)
export const pagesAPI = {
  get: (key) => api.get(`/pages/${key}`),
  update: (key, data) => api.put(`/pages/${key}`, data),
};
