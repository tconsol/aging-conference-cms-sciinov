import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// A missing VITE_API_URL at build time compiles down to `baseURL: undefined`,
// which points every request at the admin's own origin. The SPA host answers
// those with index.html and a 200, so failures surface as nonsense property
// errors on the HTML string instead of anything resembling a network problem.
// (A UTF-8 BOM on the first line of .env is enough to cause it: the key is then
// read as "﻿VITE_API_URL".) Say so at boot rather than at the first login.
if (!API_URL) {
  console.error(
    '[admin] VITE_API_URL is not set — this build has no API base URL. ' +
    'Requests will hit this origin and get HTML back. Rebuild with a valid admin/.env.'
  );
}

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  // "undefined" is a truthy string — sending `Bearer undefined` would turn a
  // config problem into a confusing 401 instead of an anonymous request.
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
