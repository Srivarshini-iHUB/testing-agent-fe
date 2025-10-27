import axios from 'axios';
import { authConfig } from '../config/auth';

const API_BASE_URL = authConfig.apiBaseUrl;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 600000, // 10 minutes for large documents
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add logging and auth token
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);
    
    // Add auth token if available
    const token = localStorage.getItem(authConfig.tokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] Response received from ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server error
      const message = error.response.data?.detail || 'Server error occurred';
      console.error(`[API Error ${error.response.status}]`, message);
      error.message = message;
      
      // Handle 401 Unauthorized - clear auth token
      if (error.response.status === 401) {
        localStorage.removeItem(authConfig.tokenKey);
        localStorage.removeItem(authConfig.userKey);
        // Optionally redirect to login or trigger auth state update
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    } else if (error.request) {
      // Network error
      console.error('[API Network Error]', error.request);
      error.message = 'Network error. Please check your connection.';
    } else {
      // Other errors
      console.error('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;