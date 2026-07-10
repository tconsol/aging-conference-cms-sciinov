import api from './axios';

export const peopleAPI = {
  getSpeakers: (params) => api.get('/speakers', { params }),
  getSpeakerBySlug: (slug) => api.get(`/speakers/slug/${slug}`),
  getCommittee: () => api.get('/committee', { params: { active: true } }),
  getCommitteeMember: (id) => api.get(`/committee/${id}`),
  getOrganizers: () => api.get('/organizers', { params: { active: true } }),
  applyToSpeak: (data) => api.post('/speaker-applications/submit', data),
};
