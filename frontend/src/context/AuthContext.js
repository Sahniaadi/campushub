import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem('campushub_token');
    const stored = localStorage.getItem('campushub_user');
    if (token && stored) {
      try { setUser(JSON.parse(stored)); } catch { /* invalid JSON */ }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('campushub_token', data.token);
    localStorage.setItem('campushub_user', JSON.stringify(data.user));
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name}! 👋`);
    return data;
  };

  const register = async (form) => {
    const { data } = await API.post('/auth/register', form);
    localStorage.setItem('campushub_token', data.token);
    localStorage.setItem('campushub_user', JSON.stringify(data.user));
    setUser(data.user);
    toast.success('Account created! Welcome to CampusHub 🎉');
    return data;
  };

  const logout = () => {
    localStorage.removeItem('campushub_token');
    localStorage.removeItem('campushub_user');
    setUser(null);
    toast.success('Logged out successfully.');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('campushub_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
