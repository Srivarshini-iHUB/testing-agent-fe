import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 600000, // 10 minutes for large documents
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);
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