import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate user session safely on initial client render
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('trustguard_token');
          const storedUser = localStorage.getItem('trustguard_user');

          if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (err) {
        console.warn('Session hydration warning:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    const { token: authToken, user: userData } = res.data;

    setToken(authToken);
    setUser(userData);

    if (typeof window !== 'undefined') {
      localStorage.setItem('trustguard_token', authToken);
      localStorage.setItem('trustguard_user', JSON.stringify(userData));
    }

    return userData;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { token: authToken, user: userData } = res.data;

    setToken(authToken);
    setUser(userData);

    if (typeof window !== 'undefined') {
      localStorage.setItem('trustguard_token', authToken);
      localStorage.setItem('trustguard_user', JSON.stringify(userData));
    }

    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('trustguard_token');
      localStorage.removeItem('trustguard_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
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
