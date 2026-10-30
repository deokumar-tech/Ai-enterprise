import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('nexus_token'));
  const [loading, setLoading] = useState(true);

  // Configure axios instance defaults
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Load user session on mount
  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('nexus_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (res.data?.success && res.data.user) {
          setUser(res.data.user);
          setToken(storedToken);
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification error:', err.response?.data || err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data?.token) {
        const receivedToken = res.data.token;
        const userData = res.data.user;
        localStorage.setItem('nexus_token', receivedToken);
        setToken(receivedToken);
        setUser(userData);
        api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
        return { success: true };
      }
      return { success: false, error: 'Login failed: Invalid server response' };
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.details?.[0]?.message || 'Login failed. Please check credentials.';
      return { success: false, error: msg };
    }
  };

  const register = async (full_name, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { full_name, email, password });
      if (res.data?.token) {
        const receivedToken = res.data.token;
        const userData = res.data.user;
        localStorage.setItem('nexus_token', receivedToken);
        setToken(receivedToken);
        setUser(userData);
        api.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
        return { success: true };
      }
      return { success: false, error: 'Registration failed: Invalid response' };
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.details?.[0]?.message || 'Registration failed.';
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('nexus_token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        loading,
        login,
        register,
        logout,
        api,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

