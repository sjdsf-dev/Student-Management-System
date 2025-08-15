import axios from 'axios';
import { API_URL } from '../config/configs';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Ensure cookies are sent with requests
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add common headers
apiClient.interceptors.request.use(
  (config) => {
    // Add any common headers here if needed
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      // Handle authentication errors
      if (status === 401 || status === 403) {
        console.warn('Authentication error detected:', status);
        
        // Clear any stored user info
        localStorage.removeItem('userInfo');
        sessionStorage.removeItem('userInfo');
        
        // Redirect to login page
        window.location.href = '/auth/login';
        return Promise.reject(new Error('Authentication failed'));
      }
      
      // Handle other HTTP errors
      if (status >= 500) {
        console.error('Server error:', error.response.data);
        return Promise.reject(new Error('Server error occurred'));
      }
    }
    
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      return Promise.reject(new Error('Request timeout'));
    }
    
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject(new Error('Network error occurred'));
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
