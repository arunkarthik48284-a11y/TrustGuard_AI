import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:5005/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization Bearer token automatically if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trustguard_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
};

export const securityAPI = {
  scan: (payload) => api.post('/security/scan', payload),
  getLogs: (params) => api.get('/security/logs', { params }),
  getMetrics: () => api.get('/security/metrics')
};

export const policyAPI = {
  getPolicies: () => api.get('/policies'),
  updatePolicy: (id, policyData) => api.put(`/policies/${id}`, policyData)
};

export default api;
