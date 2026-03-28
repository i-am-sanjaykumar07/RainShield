import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';
import SplashScreen from '../components/SplashScreen';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const processUser = (userData) => {
    // Admin users completely bypass the deposit requirement
    const adminEmails = (process.env.REACT_APP_ADMIN_EMAILS || 'palisettysanjaykumar@gmail.com,sanjay@cu.edu.in').split(',');
    if (userData && adminEmails.includes(userData.email)) {
      userData.depositMade = true;
    }
    return userData;
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(processUser(response.data.user));
    } catch (error) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login to:', api.defaults.baseURL);
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const processedUser = processUser(user);
      setUser(processedUser);
      return processedUser;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (email, phone, password) => {
    const response = await api.post('/auth/register', { email, phone, password });
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    const processedUser = processUser(user);
    setUser(processedUser);
    return processedUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(prev => processUser({ ...prev, ...userData }));
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <SplashScreen /> : children}
    </AuthContext.Provider>
  );
};