import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 Unauthorized globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is strictly invalid, systematically ejecting all session orphans
      console.warn("401 Unauthorized: Ejecting session artifacts...");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
      
      // Removed destructive window.location.href = '/login' forced overrides.
      // 401 cascades gracefully downwards where frontend AuthContext unmounts naturally!
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
