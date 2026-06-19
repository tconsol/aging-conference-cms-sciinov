import api from './axios';

export const submissionsAPI = {
  submitAbstract: (formData) => api.post('/abstracts/submit', formData),
  submitRegistration: (data) => api.post('/registrations/submit', data),
  getPricing: (params) => api.get('/pricing', { params }),
  getActivePricing: () => api.get('/pricing/active'),
};
