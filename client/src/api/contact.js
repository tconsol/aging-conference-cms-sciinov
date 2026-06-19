import api from './axios';

export const contactAPI = {
  send: (data) => api.post('/contact', data),
  getFAQs: () => api.get('/help/faqs', { params: { active: true } }),
  submitTicket: (data) => api.post('/help/tickets', data),
  submitSponsorship: (data) => api.post('/sponsorship/submit', data),
};
