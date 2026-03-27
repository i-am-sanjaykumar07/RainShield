import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? 'https://your-backend-url.vercel.app/api' : 'http://localhost:5000/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;