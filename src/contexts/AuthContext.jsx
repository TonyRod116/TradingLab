import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  setToken as setTokenStorage, 
  getToken, 
  setRefreshToken, 
  removeToken, 
  getUser, 
  isTokenExpired 
} from '../utils/auth.js';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  const updateUser = useCallback((newUserData) => {
    setUser(newUserData);
  }, []);

  // Setup axios interceptors
  useEffect(() => {
    axios.defaults.baseURL = 'http://localhost:8000';
    
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const currentToken = getToken();
        if (currentToken && !isTokenExpired()) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [logout]);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const currentToken = getToken();
      
      if (currentToken && !isTokenExpired()) {
        const userData = getUser();
        
        if (userData) {
          setUser(userData);
          setTokenState(currentToken);
        } else {
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [logout]);

  // Sync token state with localStorage
  useEffect(() => {
    const currentToken = getToken();
    if (currentToken !== token) {
      setTokenState(currentToken);
    }
  }, [token]);

  const extractUserFromToken = useCallback((token) => {
    try {
      const payloadString = token.split('.')[1];
      const payload = JSON.parse(atob(payloadString));
      
      return {
        id: payload.user_id || payload.id,
        username: payload.username,
        email: payload.email
      };
    } catch (error) {
      return null;
    }
  }, []);

  const extractErrorMessage = useCallback((error) => {
    if (error.response?.data) {
      const data = error.response.data;
      
      if (typeof data === 'string') {
        return data;
      }
      
      if (typeof data === 'object') {
        if (data.detail) return data.detail;
        if (data.error) return data.error;
        if (data.message) return data.message;
        
        // Handle field-specific errors
        if (data.username) {
          const usernameError = Array.isArray(data.username) ? data.username[0] : data.username;
          return usernameError.includes('already exists') ? 'Username already exists' : `Username: ${usernameError}`;
        }
        
        if (data.email) {
          const emailError = Array.isArray(data.email) ? data.email[0] : data.email;
          return emailError.includes('already exists') ? 'Email already exists' : `Email: ${emailError}`;
        }
        
        if (data.password) {
          const passwordError = Array.isArray(data.password) ? data.password[0] : data.password;
          return `Password: ${passwordError}`;
        }
        
        // Return first error if multiple exist
        const firstError = Object.values(data)[0];
        return Array.isArray(firstError) ? firstError[0] : JSON.stringify(data);
      }
    }
    
    // Fallback error messages
    if (error.code === 'ERR_NETWORK') {
      return 'Network error - please check your connection';
    }
    
    if (error.code === 'ERR_BAD_REQUEST') {
      return 'Bad request - please check your input data';
    }
    
    return error.message || 'An unexpected error occurred';
  }, []);

  const login = useCallback(async (identifier, password) => {
    try {
      const isEmail = identifier.includes('@');
      const payload = {
        username: identifier,
        password
      };
      
      if (isEmail) {
        payload.email = identifier;
      }
      
      const response = await axios.post('/users/login/', payload);
      
      const { access, refresh } = response.data;
      
      const userData = extractUserFromToken(access);
      
      setTokenStorage(access);
      setRefreshToken(refresh);
      setTokenState(access);
      setUser(userData);
      
      return { success: true, redirectTo: '/strategies' };
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }, [extractUserFromToken, extractErrorMessage]);

  const signup = useCallback(async (username, email, password, confirmPassword) => {
    try {
      const response = await axios.post('/users/signup/', {
        username,
        email,
        password,
        confirmPassword
      });
      
      const { access, user: userData } = response.data;
      
      setTokenStorage(access);
      setTokenState(access);
      setUser(userData);
      
      return { success: true, redirectTo: '/strategies' };
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }, [extractErrorMessage]);

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!token && !isTokenExpired()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
