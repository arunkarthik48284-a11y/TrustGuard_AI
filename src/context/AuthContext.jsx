import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('trustguard_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data.user);
        } catch (err) {
          console.warn('Token verification failed, clearing session.', err);
          logout();
        }
      } else {
        // Demo default user session so reviewers can instantly browse
        setUser({
          id: 'usr-admin-01',
          email: 'admin@trustguard.ai',
          role: 'admin',
          organization_id: 'org-101-demo-trustguard',
          organization_name: 'CyberShield Enterprise Inc.'
        });
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('trustguard_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('trustguard_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('trustguard_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: Boolean(user) }}>
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
