import axios from 'axios';

// Determine API Base URL safely across development & production environments
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '/api' : 'http://localhost:5005/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15-second API request timeout guardrail
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token securely if present in localStorage
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

// Response Interceptor: Format error responses and handle expired tokens gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'An unexpected security service error occurred.';

    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Security request timed out (15s). Please retry.';
    } else if (error.response) {
      if (error.response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('trustguard_token');
          localStorage.removeItem('trustguard_user');
        }
        errorMessage = 'Session expired. Please sign in again.';
      } else {
        errorMessage = error.response.data?.error || error.response.data?.message || `Server error (${error.response.status})`;
      }
    } else if (error.request) {
      errorMessage = 'Unable to reach TrustGuard Security Engine. Please check your network.';
    }

    // Attach user-friendly error string to response object
    error.userMessage = errorMessage;
    return Promise.reject(error);
  }
);

// High-level API Service Exports
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/me'),
};

export const securityAPI = {
  scanPayload: (payload) => api.post('/security/scan', payload),
  getLogs: (params) => api.get('/security/logs', { params }),
  getMetrics: () => api.get('/security/metrics'),
};

export const policyAPI = {
  getPolicies: () => api.get('/policies'),
  updatePolicy: (id, policyData) => api.put(`/policies/${id}`, policyData),
};

export default api;
