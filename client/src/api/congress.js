import api from './axios';

export const congressAPI = {
  getAll: () => api.get('/editions'),
  getActive: () => api.get('/editions/active'),
  getOne: (id) => api.get(`/editions/${id}`),
  getSessions: (params) => api.get('/sessions', { params }),
  getSessionById: (id) => api.get(`/sessions/${id}`),
  getProgram: (params) => api.get('/program', { params }),
  getImportantDates: (params) => api.get('/important-dates', { params }),
  getVenues: (params) => api.get('/venues', { params }),
  getVenueByEdition: (editionId) => api.get(`/venues/by-edition/${editionId}`),
};
