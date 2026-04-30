import axios from 'axios';
import toast from 'react-hot-toast';

// Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to add token
// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    // List of endpoints that should NOT include auth tokens
    const publicEndpoints = [
      '/auth/login/',
      '/auth/register/',
      '/auth/token/refresh/',
    ];

    const isPublic = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );

    if (!isPublic) {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken
          });

          if (response.data.access) {
            localStorage.setItem('access_token', response.data.access);
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            return api(originalRequest);
          }
        }
      } catch {
        // Refresh token failed - redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
        }
      }
    }

    // Handle other errors
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 
                     error.response.data?.error || 
                     error.response.data?.detail ||
                     'An error occurred';
      
      // Don't show toast for 401 (handled above) or validation errors (handled by forms)
      if (error.response.status !== 401 && error.response.status !== 400) {
        toast.error(message);
      }

      return Promise.reject({
        status: error.response.status,
        message: message,
        data: error.response.data,
      });
    } else if (error.request) {
      // Request made but no response
      toast.error('Network error. Please check your connection.');
      return Promise.reject({
        status: null,
        message: 'Network error',
        data: null,
      });
    } else {
      // Something else happened
      toast.error('An unexpected error occurred');
      return Promise.reject({
        status: null,
        message: error.message,
        data: null,
      });
    }
  }
);

// API response wrapper
class APIResponse {
  constructor(success, data, message, status) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.status = status;
  }
}

// Helper methods for common API calls
const apiService = {
  // GET request
  async get(url, params = {}) {
    try {
      const response = await api.get(url, { params });
      return new APIResponse(true, response.data, 'Success', response.status);
    } catch (error) {
      return new APIResponse(false, null, error.message, error.status);
    }
  },

  // POST request
  async post(url, data = {}) {
    try {
      const response = await api.post(url, data);
      return new APIResponse(true, response.data, 'Success', response.status);
    } catch (error) {
      return new APIResponse(false, null, error.message, error.status);
    }
  },

  // PUT request
  async put(url, data = {}) {
    try {
      const response = await api.put(url, data);
      return new APIResponse(true, response.data, 'Success', response.status);
    } catch (error) {
      return new APIResponse(false, null, error.message, error.status);
    }
  },

  // PATCH request
  async patch(url, data = {}) {
    try {
      const response = await api.patch(url, data);
      return new APIResponse(true, response.data, 'Success', response.status);
    } catch (error) {
      return new APIResponse(false, null, error.message, error.status);
    }
  },

  // DELETE request
  async delete(url) {
    try {
      const response = await api.delete(url);
      return new APIResponse(true, response.data, 'Success', response.status);
    } catch (error) {
      return new APIResponse(false, null, error.message, error.status);
    }
  },

  // Upload file
  async upload(url, file, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
      });
      return new APIResponse(true, response.data, 'Success', response.status);
    } catch (error) {
      return new APIResponse(false, null, error.message, error.status);
    }
  },

  // WebSocket connection helper
  getWebSocketUrl(path) {
    const token = localStorage.getItem('access_token');
    const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    return `${WS_BASE_URL}${path}?token=${token}`;
  },
};

// Export the configured axios instance and service
export { api as axiosInstance };
export default apiService;

// Also export the base URL for use in other files
export const BASE_URL = API_BASE_URL;