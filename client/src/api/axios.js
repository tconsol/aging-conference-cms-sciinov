import axios from 'axios';

// NOTE: do NOT set a default 'Content-Type' here.
// Axios v1 serializes FormData to JSON when a JSON content-type is already set,
// which silently drops File objects. Axios infers the correct type per request:
// application/json for plain objects, multipart/form-data (with boundary) for FormData.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export default api;
