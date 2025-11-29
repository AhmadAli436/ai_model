'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, AuthResponse } from '../api/auth';

interface AuthContextType {
  user: AuthResponse['user'] | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [loading, setLoading] = useState(true);

  // Save user to localStorage
  const saveUser = (userData: AuthResponse['user'] | null) => {
    if (typeof window === 'undefined') return;
    if (userData) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  // Load user from localStorage
  const loadUser = (): AuthResponse['user'] | null => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
    }
    return null;
  };

  useEffect(() => {
    // Check if user is already authenticated - simply check for token
    const checkAuth = () => {
      // Check if token exists in localStorage
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('auth_token')
          : null;

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // If token exists, try to load user from localStorage
      const storedUser = loadUser();
      if (storedUser) {
        setUser(storedUser);
      } else {
        // If no stored user but token exists, create a minimal user object
        // This allows the user to stay authenticated
        setUser({
          id: 'user',
          email: 'user@example.com',
          name: undefined,
        });
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      setUser(response.user);
      saveUser(response.user);
    } catch (error) {
      // Re-throw error so it can be handled by the component
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await authApi.register({ email, password, name });
      setUser(response.user);
      saveUser(response.user);
    } catch (error) {
      // Re-throw error so it can be handled by the component
      throw error;
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    saveUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
