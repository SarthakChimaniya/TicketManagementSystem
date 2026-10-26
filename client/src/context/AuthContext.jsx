import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('imovies_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('imovies_token'));
  const [loading, setLoading] = useState(true);

  // Modal display states
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Check current session validity on mount
  useEffect(() => {
    const checkSession = async () => {
      const storedToken = localStorage.getItem('imovies_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('imovies_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.warn('[Auth] Session validation failed or expired');
          logout();
        }
      }
      setLoading(false);
    };

    checkSession();

    // Listen for custom auth changes (e.g., from 401 interceptor)
    const handleAuthChange = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data.success) {
      const { token: receivedToken, data: userData } = res.data;
      setToken(receivedToken);
      setUser(userData);
      localStorage.setItem('imovies_token', receivedToken);
      localStorage.setItem('imovies_user', JSON.stringify(userData));
      closeModals();
      return userData;
    }
    throw new Error(res.data.error || 'Login failed');
  };

  const register = async ({ email, username, password, role }) => {
    const res = await authAPI.register({ email, username, password, role });
    if (res.data.success) {
      const { token: receivedToken, data: userData } = res.data;
      setToken(receivedToken);
      setUser(userData);
      localStorage.setItem('imovies_token', receivedToken);
      localStorage.setItem('imovies_user', JSON.stringify(userData));
      closeModals();
      return userData;
    }
    throw new Error(res.data.error || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('imovies_token');
    localStorage.removeItem('imovies_user');
  };

  const openLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const openRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const closeModals = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        isLoginOpen,
        isRegisterOpen,
        openLogin,
        openRegister,
        closeModals
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
