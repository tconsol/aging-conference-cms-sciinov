import api from './axios';

export const submissionsAPI = {
  submitAbstract: (formData) => api.post('/abstracts/submit', formData),
  submitRegistration: (data) => api.post('/registrations/submit', data),
  getPricing: (params) => api.get('/pricing', { params }),
  getActivePricing: (params) => api.get('/pricing/active', { params }),
  trackRegistrationIntent: (data) => api.post('/registrations/intent', data),
  createPaypalOrder: (data) => api.post('/registrations/paypal/create-order', data),
  capturePaypalOrder: (data) => api.post('/registrations/paypal/capture-order', data),
};
