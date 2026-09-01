import api from './axios';

// Abstracts
export const abstractsAPI = {
  getAll: (params) => api.get('/abstracts', { params }),
  getOne: (id) => api.get(`/abstracts/${id}`),
  updateStatus: (id, data) => api.patch(`/abstracts/${id}/status`, data),
  updateAbstract: (id, data) => api.patch(`/abstracts/${id}`, data),
  downloadFile: (id) => api.get(`/abstracts/${id}/file`, { responseType: 'blob' }),
  downloadAcceptanceLetter: (id) => api.get(`/abstracts/${id}/acceptance-letter`, { responseType: 'blob' }),
  delete: (id) => api.delete(`/abstracts/${id}`),
};

// Registrations
export const registrationsAPI = {
  getAll: (params) => api.get('/registrations', { params }),
  create: (data) => api.post('/registrations', data),
  getOne: (id) => api.get(`/registrations/${id}`),
  updatePayment: (id, data) => api.patch(`/registrations/${id}/payment`, data),
  delete: (id) => api.delete(`/registrations/${id}`),
  exportCSV: (params) => api.get('/registrations/export/csv', { params, responseType: 'blob' }),
  sendReminder: (id) => api.post(`/registrations/${id}/remind`),
  // Intents (tried but not paid)
  getIntents: (params) => api.get('/registrations/intents', { params }),
  getOneIntent: (id) => api.get(`/registrations/intents/${id}`),
  sendIntentReminder: (id) => api.post(`/registrations/intents/${id}/remind`),
};
