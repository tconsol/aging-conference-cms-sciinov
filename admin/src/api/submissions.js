import api from './axios';

// Abstracts
export const abstractsAPI = {
  getAll: (params) => api.get('/abstracts', { params }),
  getOne: (id) => api.get(`/abstracts/${id}`),
  updateStatus: (id, data) => api.patch(`/abstracts/${id}/status`, data),
  updateAbstract: (id, data) => api.patch(`/abstracts/${id}`, data),
  delete: (id) => api.delete(`/abstracts/${id}`),
};

// Registrations
export const registrationsAPI = {
  getAll: (params) => api.get('/registrations', { params }),
  getOne: (id) => api.get(`/registrations/${id}`),
  updatePayment: (id, data) => api.patch(`/registrations/${id}/payment`, data),
  delete: (id) => api.delete(`/registrations/${id}`),
  exportCSV: (params) => api.get('/registrations/export/csv', { params, responseType: 'blob' }),
};
