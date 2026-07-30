import axios from 'axios';

const portalApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

portalApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('submitterToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default portalApi;
