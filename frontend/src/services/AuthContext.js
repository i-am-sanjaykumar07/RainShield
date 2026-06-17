import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';
import SplashScreen from '../components/SplashScreen';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const processUser = (userData) => {
    if (!userData) return null;
    // Auto-approve and credit admins for seamless testing
    const adminEmails = (process.env.REACT_APP_ADMIN_EMAILS || 'palisettysanjaykumar@gmail.com,sanjay@cu.edu.in').split(',');
    if (adminEmails.includes(userData.email)) {
      if (!userData.depositMade) {
        userData.depositMade = true;
        userData.walletBalance = (userData.walletBalance || 0) + 400; // Provide starting funds
      }
    }
    return userData;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const cachedUser = localStorage.getItem('user');
    
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
      setLoading(false); // Immediate UI with cached data
    }

    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      const processed = processUser(response.data.user);
      setUser(processed);
      localStorage.setItem('user', JSON.stringify(processed)); // Update cache
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
      localStorage.setItem('user', JSON.stringify(processedUser)); // Cache user
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
    localStorage.setItem('user', JSON.stringify(processedUser)); // Cache user
    setUser(processedUser);
    return processedUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Clear cache
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(prev => {
      const updated = { ...prev, ...userData };
      localStorage.setItem('user', JSON.stringify(updated)); // Update cache
      return updated;
    });
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