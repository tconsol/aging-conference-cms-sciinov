import api from './axios';

// Site Settings
export const siteSettingsAPI = {
  get: () => api.get('/site-settings'),
  update: (data) => api.put('/site-settings', data),
  updateHomepage: (data) => api.patch('/site-settings', { homepage: data }),
  updateTheme: (data) => api.patch('/site-settings', { theme: data }),
  // PATCH rather than the multipart PUT: that route is super_admin only, and
  // these sections are plain JSON with no files attached.
  updateAboutPage: (data) => api.patch('/site-settings', { aboutPage: data }),
  // Sample abstract template offered for download on the public submission page.
  // Its own endpoint because the main PUT runs an image-only upload filter.
  uploadSampleAbstract: (formData) => api.put('/site-settings/sample-abstract', formData),
  deleteSampleAbstract: () => api.delete('/site-settings/sample-abstract'),
};

// Google Fonts catalogue, proxied by the API so the key stays server-side
export const fontsAPI = {
  getAll: () => api.get('/fonts'),
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

// Show/hide switches for public pages and sections
export const visibilityAPI = {
  getAdmin: () => api.get('/visibility/admin'),
  update: (visibility) => api.patch('/visibility', { visibility }),
};
