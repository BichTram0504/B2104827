import axios from 'axios';
import config from '../config/environment';

// Create axios instance with default config
const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('jwt');
          localStorage.removeItem('isAdmin');
          localStorage.removeItem('isVoter');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 429:
          // Rate limit exceeded
          console.error('Rate limit exceeded');
          // Hiển thị thông báo rate limit
          const rateLimitMessage = data?.error || 'Quá nhiều yêu cầu, vui lòng thử lại sau';
          const rateLimitCode = data?.code || 'RATE_LIMIT_EXCEEDED';
          
          // Tạo custom error với thông tin rate limit
          const rateLimitError = new Error(rateLimitMessage);
          rateLimitError.isRateLimit = true;
          rateLimitError.rateLimitCode = rateLimitCode;
          rateLimitError.retryAfter = error.response.headers['retry-after'];
          
          // Hiển thị thông báo cho người dùng
          if (typeof window !== 'undefined' && window.showRateLimitNotification) {
            window.showRateLimitNotification(rateLimitMessage, rateLimitCode, error.response.headers['retry-after']);
          }
          break;
        case 500:
          // Server error
          console.error('Server error');
          break;
        default:
          console.error('API error:', data);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.request);
    } else {
      // Other error
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials) => api.post('/api/voters/login', credentials),
    register: (userData) => api.post('/api/voters/register', userData),
    adminLogin: (credentials) => api.post('/api/admins/login', credentials),
  },

  // Voter endpoints
  voters: {
    getAll: (params) => api.get('/api/voters', { params }),
    getById: (id) => api.get(`/api/voters/${id}`),
    update: (id, data) => api.put(`/api/voters/${id}`, data),
    delete: (id) => api.delete(`/api/voters/${id}`),
    lock: (cccd) => api.patch(`/api/voters/${cccd}/lock`),
  },

  // Admin endpoints
  admins: {
    getAll: () => api.get('/api/admins'),
    create: (adminData) => api.post('/api/admins', adminData),
    delete: (id) => api.delete(`/api/admins/${id}`),
    getMe: () => api.get('/api/admins/me'),
  },

  // Election endpoints
  elections: {
    getAll: () => api.get('/api/elections'),
    getById: (id) => api.get(`/api/elections/${id}`),
    create: (electionData) => api.post('/api/elections', electionData),
    update: (id, data) => api.put(`/api/elections/${id}`, data),
    delete: (id) => api.delete(`/api/elections/${id}`),
    complete: (id) => api.put(`/api/elections/${id}/complete`),
    getResults: (id) => api.get(`/api/elections/${id}/results`),
  },

  // Candidate endpoints
  candidates: {
    getAll: (params) => api.get('/api/candidates', { params }),
    getById: (id) => api.get(`/api/candidates/${id}`),
    create: (candidateData) => api.post('/api/candidates', candidateData),
    update: (id, data) => api.put(`/api/candidates/${id}`, data),
    delete: (id) => api.delete(`/api/candidates/${id}`),
  },

  // Vote endpoints
  votes: {
    create: (voteData) => api.post('/api/votes', voteData),
    getMine: (params) => api.get('/api/votes/mine', { params }),
    getReceipt: (params) => api.get('/api/votes/receipt', { params }),
    getAll: (params) => api.get('/api/votes', { params }),
  },

  // Chatbot endpoints
  chatbot: {
    sendMessage: (messageData) => api.post('/api/chatbot/send-message', messageData),
    getIntents: () => api.get('/api/chatbot/intents'),
    getStats: () => api.get('/api/chatbot/stats'),
  },
};

// Helper functions
export const apiHelpers = {
  // Handle API errors consistently
  handleError: (error) => {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      error: config.errors.networkError,
    };
  },

  // Create success response
  createSuccessResponse: (data, message = '') => ({
    success: true,
    data,
    message,
  }),

  // Validate response
  validateResponse: (response) => {
    if (response.data && response.data.success !== false) {
      return response.data;
    }
    throw new Error(response.data?.error || 'API response error');
  },
};

export default api;
