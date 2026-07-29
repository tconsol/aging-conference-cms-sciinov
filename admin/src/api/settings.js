import api from './axios';

// Site Settings
export const siteSettingsAPI = {
  get: () => api.get('/site-settings'),
  update: (data) => api.put('/site-settings', data),
  updateHomepage: (data) => api.patch('/site-settings', { homepage: data }),
  updateTheme: (data) => api.patch('/site-settings', { theme: data }),
};

// Admin Users
export const adminUsersAPI = {
  getAll: () => api.get('/admin-users'),
  getOne: (id) => api.get(`/admin-users/${id}`),
  create: (data) => api.post('/admin-users', data),
  update: (id, data) => api.put(`/admin-users/${id}`, data),
  resetPassword: (id, newPassword) => api.patch(`/admin-users/${id}/reset-password`, { newPassword }),
  delete: (id) => api.delete(`/admin-users/${id}`),
};
