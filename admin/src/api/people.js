import api from './axios';

// Speakers
export const speakersAPI = {
  getAll: (params) => api.get('/speakers', { params }),
  getOne: (id) => api.get(`/speakers/${id}`),
  create: (data) => api.post('/speakers', data),
  update: (id, data) => api.put(`/speakers/${id}`, data),
  delete: (id) => api.delete(`/speakers/${id}`),
};

// Committee Members
export const committeeAPI = {
  getAll: () => api.get('/committee'),
  getOne: (id) => api.get(`/committee/${id}`),
  create: (data) => api.post('/committee', data),
  update: (id, data) => api.put(`/committee/${id}`, data),
  delete: (id) => api.delete(`/committee/${id}`),
};

// Organizers
export const organizersAPI = {
  getAll: () => api.get('/organizers'),
  getOne: (id) => api.get(`/organizers/${id}`),
  create: (data) => api.post('/organizers', data),
  update: (id, data) => api.put(`/organizers/${id}`, data),
  delete: (id) => api.delete(`/organizers/${id}`),
};
