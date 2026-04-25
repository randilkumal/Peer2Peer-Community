import axios from 'axios';
import { toast } from 'react-hot-toast';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
API.interceptors.response.use(
  (response) => {
    // If backend returns success: false but status 200, we could also toast here
    return response;
  },
  (error) => {
    // Handle specific error messages from backend
    const message = error.response?.data?.message || error.response?.data?.error || error.message;

    // No HTTP response usually means the backend is not running or wrong URL
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      toast.error('Cannot reach server. Please check if the backend is running.');
      console.warn(
        '[API] Cannot reach server. Start the backend: cd backend → npm start (default http://localhost:5000). ' +
          'Frontend baseURL:',
        import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      );
    } else if (error.response?.status >= 400 && error.config?.showToast !== false) {
      // Don't toast for common 401s that are handled by redirect, or if explicitly disabled
      if (error.response.status !== 401 || error.config?.url?.includes('/auth/login')) {
        toast.error(message);
      }
    }

    // CRITICAL FIX: Only redirect on 401 for non-auth endpoints
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      
      // Don't auto-logout if it's the /auth/me verification call
      if (!isAuthEndpoint && !error.config?.url?.includes('/auth/me')) {
        console.log('🚨 401 Unauthorized - Redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;