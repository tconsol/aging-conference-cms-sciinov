import api from './axios';

// Editions
export const editionsAPI = {
  getAll: () => api.get('/editions'),
  getOne: (id) => api.get(`/editions/${id}`),
  create: (data) => api.post('/editions', data),
  update: (id, data) => api.put(`/editions/${id}`, data),
  delete: (id) => api.delete(`/editions/${id}`),
  setActive: (id) => api.patch(`/editions/${id}/set-active`),
  updateMaterials: (id, data) => api.patch(`/editions/${id}/materials`, data),
};

// Gallery
export const galleryAPI = {
  getAll: (params) => api.get('/gallery', { params }),
  create: (data) => api.post('/gallery', data),
  update: (id, data) => api.patch(`/gallery/${id}`, data),
  delete: (id) => api.delete(`/gallery/${id}`),
};

// Scientific Sessions
export const sessionsAPI = {
  getAll: (params) => api.get('/sessions', { params }),
  getOne: (id) => api.get(`/sessions/${id}`),
  create: (data) => api.post('/sessions', data),
  update: (id, data) => api.put(`/sessions/${id}`, data),
  delete: (id) => api.delete(`/sessions/${id}`),
  reorder: (items) => api.patch('/sessions/reorder', { items }),
};

// Program Slots
export const programAPI = {
  getAll: (params) => api.get('/program', { params }),
  getOne: (id) => api.get(`/program/${id}`),
  create: (data) => api.post('/program', data),
  update: (id, data) => api.put(`/program/${id}`, data),
  delete: (id) => api.delete(`/program/${id}`),
};

// Important Dates
export const datesAPI = {
  getAll: (params) => api.get('/important-dates', { params }),
  getOne: (id) => api.get(`/important-dates/${id}`),
  create: (data) => api.post('/important-dates', data),
  update: (id, data) => api.put(`/important-dates/${id}`, data),
  delete: (id) => api.delete(`/important-dates/${id}`),
};

// Venues
export const venuesAPI = {
  getAll: () => api.get('/venues'),
  getOne: (id) => api.get(`/venues/${id}`),
  create: (data) => api.post('/venues', data),
  update: (id, data) => api.put(`/venues/${id}`, data),
  delete: (id) => api.delete(`/venues/${id}`),
  removePhoto: (id, publicId) => api.patch(`/venues/${id}/remove-photo`, { publicId }),
};
