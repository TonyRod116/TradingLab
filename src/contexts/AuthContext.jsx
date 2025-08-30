import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { setToken as setTokenStorage, getToken, setRefreshToken, removeToken, getUser, isTokenExpired } from '../utils/auth.js';

// Create context
const AuthContext = createContext();

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(true);

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
  }, []);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const currentToken = getToken();
      console.log('🔍 CheckAuth - Token from localStorage:', currentToken);
      
      if (currentToken && !isTokenExpired()) {
        console.log('🔍 CheckAuth - Token is valid, extracting user data');
        const userData = getUser();
        console.log('🔍 CheckAuth - User data extracted:', userData);
        
        if (userData) {
          setUser(userData);
          setTokenState(currentToken);
          console.log('🔍 CheckAuth - User authenticated successfully');
        } else {
          console.log('🔍 CheckAuth - No user data, logging out');
          logout();
        }
      } else {
        console.log('🔍 CheckAuth - No token or token expired');
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Sync token state with localStorage
  useEffect(() => {
    const currentToken = getToken();
    if (currentToken !== token) {
      setTokenState(currentToken);
    }
  }, [token]);

  // Helper function to extract user data from JWT token
  const getUserFromToken = (token) => {
    try {
      const payloadString = token.split('.')[1];
      const payload = JSON.parse(atob(payloadString));
      console.log('🔍 JWT Payload:', payload);
      
      // Extraer información del usuario del payload del token
      return {
        id: payload.user_id || payload.id,
        username: payload.username,
        email: payload.email
      };
    } catch (error) {
      console.error('Error extracting user from token:', error);
      return null;
    }
  };

  // Helper function to extract error message
  const extractErrorMessage = (error) => {
    console.log('🔍 Full error object:', error);
    console.log('🔍 Error response data:', error.response?.data);
    
    if (error.response?.data) {
      const data = error.response.data;
      
      // Handle different error formats
      if (typeof data === 'string') {
        return data;
      }
      
      if (typeof data === 'object') {
        console.log('🔍 Error data keys:', Object.keys(data));
        
        // Check for common error fields
        if (data.detail) {
          return data.detail;
        }
        
        if (data.error) {
          return data.error;
        }
        
        if (data.message) {
          return data.message;
        }
        
        // Handle field-specific errors
        if (data.username) {
          const usernameError = Array.isArray(data.username) ? data.username[0] : data.username;
          if (usernameError.includes('already exists')) {
            return `Username already exists`;
          }
          return `Username: ${usernameError}`;
        }
        
        if (data.email) {
          const emailError = Array.isArray(data.email) ? data.email[0] : data.email;
          if (emailError.includes('already exists')) {
            return `Email already exists`;
          }
          return `Email: ${emailError}`;
        }
        
        if (data.password) {
          const passwordError = Array.isArray(data.password) ? data.password[0] : data.password;
          return `Password: ${passwordError}`;
        }
        
        // If it's an object with multiple errors, show the first one
        const firstError = Object.values(data)[0];
        if (Array.isArray(firstError)) {
          return firstError[0];
        }
        
        return JSON.stringify(data);
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
  };

  // Login function
  const login = async (identifier, password) => {
    try {
      console.log('🔐 Attempting login with:', { identifier, password });
      
      // Determine if identifier is email or username
      const isEmail = identifier.includes('@');
      
      // Backend requires username field, so we'll use identifier as username
      // and also send it as email if it's an email
      const payload = {
        username: identifier,
        password
      };
      
      // If it's an email, also send it as email field
      if (isEmail) {
        payload.email = identifier;
      }
      
      console.log('📤 Sending payload:', payload);
      console.log('🔍 Payload type:', isEmail ? 'email-based' : 'username-based');
      
      const response = await axios.post('/users/login/', payload);
      
      console.log('🔍 Raw response:', response);
      console.log('🔍 Response data:', response.data);
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', response.headers);
      
      console.log('✅ Login successful:', response.data);
      
      const { access, refresh } = response.data;
      console.log('🔍 Login - Access token:', access);
      console.log('🔍 Login - Response data completo:', response.data);
      
      // Extraer información del usuario del token JWT
      const userData = getUserFromToken(access);
      console.log('🔍 Login - User data extracted from token:', userData);
      
      setTokenStorage(access);
      setRefreshToken(refresh);
      setTokenState(access);
      setUser(userData);
      
      console.log('🔍 Login - User state set to:', userData);
      console.log('🔍 Login - Token state set to:', access);
      
      return { success: true, redirectTo: '/strategies' };
    } catch (error) {
      console.error('❌ Login error:', error);
      console.log('🔍 Login error response:', error.response?.data);
      console.log('🔍 Error status:', error.response?.status);
      console.log('🔍 Error headers:', error.response?.headers);
      const errorMessage = extractErrorMessage(error);
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  // Signup function
  const signup = async (username, email, password, confirmPassword) => {
    try {
      console.log('📝 Attempting signup with:', { username, email, password, confirmPassword });
      
      const response = await axios.post('/users/signup/', {
        username,
        email,
        password,
        confirmPassword
      });
      
      console.log('✅ Signup successful:', response.data);
      
      const { access, user: userData } = response.data;
      
      setTokenStorage(access);
      setTokenState(access);
      setUser(userData);
      
      return { success: true, redirectTo: '/strategies' };
    } catch (error) {
      console.error('❌ Signup error:', error);
      console.log('🔍 Signup error response:', error.response?.data);
      console.log('🔍 Signup error status:', error.response?.status);
      const errorMessage = extractErrorMessage(error);
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  // Logout function
  const logout = () => {
    console.log('🔍 Logout - Clearing user data');
    console.log('🔍 Logout - Current user before logout:', user);
    removeToken();
    setTokenState(null);
    setUser(null);
    console.log('🔍 Logout - User data cleared');
    
    // Clear any stored user data
    localStorage.removeItem('user');
  };

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
