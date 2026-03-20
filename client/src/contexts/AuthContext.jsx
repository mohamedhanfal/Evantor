import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, try to restore session from cookie
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (data.success && data.user) {
          setUser(data.user);
        }
      } catch {
        // Not authenticated — that's okay
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Login failed.' };
    } catch (err) {
      const message =
        err.response?.data?.error || 'Something went wrong. Please try again.';
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      if (data.success) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || 'Registration failed.' };
    } catch (err) {
      const message =
        err.response?.data?.error || 'Something went wrong. Please try again.';
      return { success: false, error: message };
    }
  }, []);

  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await api.put('/auth/profile', data);
      setUser(response.data.user);
      return { success: true, message: response.data.message, token: response.data.verificationToken };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Profile update failed. Please try again.',
      };
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await api.post('/auth/verify-email', { token });
      setUser(response.data.user);
      return { success: true, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Email verification failed.',
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    verifyEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
