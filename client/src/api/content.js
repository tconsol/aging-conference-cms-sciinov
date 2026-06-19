import api from './axios';

export const contentAPI = {
  getLatestNews: () => api.get('/news/latest'),
  getNews: (params) => api.get('/news', { params }),
  getNewsBySlug: (slug) => api.get(`/news/slug/${slug}`),
  getReports: () => api.get('/reports', { params: { published: true } }),
  getDownloads: () => api.get('/downloads', { params: { active: true } }),
  getBrochure: () => api.get('/brochure/latest'),
  getPage: (key) => api.get(`/pages/${key}`),
  getSiteSettings: () => api.get('/site-settings'),
};
