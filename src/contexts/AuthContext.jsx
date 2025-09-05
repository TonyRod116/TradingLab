import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api.js';
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
  console.log('🔍 AuthProvider component initialized');
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
    axios.defaults.baseURL = API_BASE_URL;
    
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
    console.log('🔍 AuthContext useEffect triggered');
    const checkAuth = async () => {
      console.log('🔍 checkAuth function called');
      const currentToken = getToken();
      console.log('🔍 Token:', currentToken ? 'Present' : 'Missing');
      
      if (currentToken && !isTokenExpired()) {
        console.log('🔍 Token valid, getting user data');
        const userData = extractUserFromToken(currentToken);
        console.log('🔍 User data from token:', userData);
        
        if (userData) {
          // If we only have ID, try to get full user data from backend
          if (userData.id && !userData.username) {
            console.log('🔍 Only ID available, fetching full user data from backend');
            try {
              const response = await axios.get('/api/users/profile/', {
                headers: {
                  'Authorization': `Bearer ${currentToken}`
                }
              });
              const fullUserData = response.data;
              console.log('🔍 Full user data from backend:', fullUserData);
              setUser({
                id: userData.id,
                username: fullUserData.username || 'User',
                email: fullUserData.email || 'user@example.com'
              });
            } catch (error) {
              console.log('🔍 Error fetching user data, using token data only:', error);
              setUser(userData);
            }
          } else {
            setUser(userData);
          }
          setTokenState(currentToken);
        } else {
          logout();
        }
      } else {
        console.log('🔍 No valid token');
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
      console.log('🔍 Token payload:', payload);
      
      return {
        id: payload.user_id || payload.id,
        username: payload.username,
        email: payload.email
      };
    } catch (error) {
      console.log('🔍 Error extracting user from token:', error);
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
        return Array.isArray(firstError) ? firstError[0] : 'Please check your input and try again';
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
      
      const response = await axios.post('/auth/login/', payload);
      
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
      const response = await axios.post('/api/users/signup/', {
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

  const isAuthenticated = !!token && !isTokenExpired();
  console.log('🔍 AuthContext - isAuthenticated:', isAuthenticated, 'token:', !!token, 'expired:', isTokenExpired());

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
