import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('trustguard_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected security engine error occurred.';
    if (error.response) {
      const errData = error.response.data?.error || error.response.data?.message || error.response.data;
      if (typeof errData === 'string') {
        message = errData;
      } else if (errData && typeof errData === 'object') {
        message = errData.message || errData.error || JSON.stringify(errData);
      } else if (error.response.status === 401) {
        message = 'Session expired. Please sign in again.';
      } else if (error.response.status === 403) {
        message = 'Unauthorized security action.';
      } else if (error.response.status === 404) {
        message = 'Requested security endpoint not found.';
      } else if (error.response.status >= 500) {
        message = 'Server security engine temporarily unavailable. Using local rules.';
      }
    } else if (error.code === 'ECONNABORTED') {
      message = 'Security request timed out after 15 seconds.';
    } else if (error.message) {
      message = typeof error.message === 'string' ? error.message : String(error.message);
    }

    error.userMessage = String(message);
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  me: () => api.get('/auth/profile'),
};

export const securityAPI = {
  scan: (data) => api.post('/security/scan', data),
  scanPayload: (data) => api.post('/security/scan', data),
  getLogs: (params) => api.get('/security/logs', { params }),
  getMetrics: () => api.get('/security/metrics'),
};

export const policyAPI = {
  getPolicies: () => api.get('/policies'),
  updatePolicy: (id, policyData) => {
    let targetId = id;
    let payload = policyData;
    if (typeof id === 'object' && !policyData) {
      payload = id;
      targetId = payload.id || 'pol-001-default';
    }
    return api.put(`/policies/${targetId || 'pol-001-default'}`, payload);
  },
};

export default api;
