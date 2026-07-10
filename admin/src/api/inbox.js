import api from './axios';

// Contact Messages
export const contactAPI = {
  getAll: (params) => api.get('/contact', { params }),
  getOne: (id) => api.get(`/contact/${id}`),
  toggleRead: (id) => api.patch(`/contact/${id}/toggle-read`),
  delete: (id) => api.delete(`/contact/${id}`),
};

// Help & Support
export const helpAPI = {
  // FAQs
  getAllFAQs: () => api.get('/help/faqs'),
  createFAQ: (data) => api.post('/help/faqs', data),
  updateFAQ: (id, data) => api.put(`/help/faqs/${id}`, data),
  deleteFAQ: (id) => api.delete(`/help/faqs/${id}`),
  // Tickets
  getAllTickets: (params) => api.get('/help/tickets', { params }),
  getTicket: (id) => api.get(`/help/tickets/${id}`),
  updateTicketStatus: (id, status) => api.patch(`/help/tickets/${id}/status`, { status }),
  deleteTicket: (id) => api.delete(`/help/tickets/${id}`),
};

// FAQ Topics
export const faqTopicsAPI = {
  getAll: () => api.get('/faq-topics'),
  getOne: (id) => api.get(`/faq-topics/${id}`),
  create: (data) => api.post('/faq-topics', data),
  update: (id, data) => api.put(`/faq-topics/${id}`, data),
  delete: (id) => api.delete(`/faq-topics/${id}`),
};
