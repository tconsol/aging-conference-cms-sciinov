import api from './axios';

export const communityAPI = {
  getPartners: () => api.get('/partners', { params: { active: true } }),
  getTestimonials: () => api.get('/testimonials', { params: { active: true } }),
  subscribe: (email) => api.post('/newsletter/subscribe', { email }),
};
