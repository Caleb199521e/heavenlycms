import axios from 'axios';

// Use environment variable for production, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with base configuration
const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor - add token and request ID
API.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return config;
  },
  (error) => {
    console.error('Request setup error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - enhanced error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'An unexpected error occurred';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.response) {
      // Server responded with error status
      errorCode = `HTTP_${error.response.status}`;
      
      switch (error.response.status) {
        case 400:
          errorMessage = error.response.data?.error || 'Invalid request data';
          break;
        case 401:
          errorMessage = 'Session expired. Please login again.';
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          // Redirect to login
          if (window.location.pathname !== '/') {
            window.location.href = '/';
          }
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 409:
          errorMessage = error.response.data?.error || 'Conflict: This item may already exist';
          break;
        case 429:
          errorMessage = 'Too many requests. Please wait before trying again.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = error.response.data?.error || 'Server error';
      }
    } else if (error.request) {
      // Request made but no response received
      errorCode = 'NO_RESPONSE';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your connection and try again.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage = 'Cannot reach server. Please check your connection.';
      }
    } else {
      // Error in request setup
      errorCode = 'REQUEST_ERROR';
      errorMessage = error.message || 'Error preparing request';
    }

    // Attach parsed error info to the error object
    error.errorMessage = errorMessage;
    error.errorCode = errorCode;

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${errorCode}] ${errorMessage}`, error);
    }

    return Promise.reject(error);
  }
);

// ─── AUTHENTICATION ───────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => API.post('/auth/login', { email, password }),
  getMe: () => API.get('/auth/me'),
  logout: () => API.post('/auth/logout'),
};

// ─── MEMBERS ──────────────────────────────────────────────────────────────────
export const membersAPI = {
  getAll: (params = {}) => API.get('/members', { params }),
  getById: (id) => API.get(`/members/${id}`),
  create: (data) => API.post('/members', data),
  update: (id, data) => API.put(`/members/${id}`, data),
  delete: (id) => API.delete(`/members/${id}`),
};

// ─── VISITORS ─────────────────────────────────────────────────────────────────
export const visitorsAPI = {
  getAll: (params = {}) => API.get('/visitors', { params }),
  getById: (id) => API.get(`/visitors/${id}`),
  create: (data) => API.post('/visitors', data),
  update: (id, data) => API.put(`/visitors/${id}`, data),
  delete: (id) => API.delete(`/visitors/${id}`),
};

// ─── SERVICES ────────────────────────────────────────────────────────────────
export const servicesAPI = {
  getAll: () => API.get('/services'),
  getById: (id) => API.get(`/services/${id}`),
  create: (data) => API.post('/services', data),
  update: (id, data) => API.put(`/services/${id}`, data),
  delete: (id) => API.delete(`/services/${id}`),
};

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
export const attendanceAPI = {
  checkin: (data) => API.post('/attendance/checkin', data),
  getByService: (serviceId) => API.get(`/attendance/service/${serviceId}`),
  getByMember: (memberId) => API.get(`/attendance/member/${memberId}`),
};

// ─── REPORTS ──────────────────────────────────────────────────────────────────
export const reportsAPI = {
  getSummary: () => API.get('/reports/summary'),
  getTrends: (period = 'weekly') => API.get('/reports/trends', { params: { period } }),
};

export default API;
