/**
 * API Configuration
 * Centralized configuration for all API endpoints
 */

// Determine the base URL based on environment
const getBaseURL = () => {
  // Check if we're in development (localhost)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  
  // Production URL (Heroku)
  return 'https://tradelab-39583a78c028.herokuapp.com';
};

// Export the base URL
export const API_BASE_URL = getBaseURL();

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login/',
  REGISTER: '/auth/register/',
  REFRESH: '/auth/refresh/',
  LOGOUT: '/auth/logout/',
  
  // User management
  PROFILE: '/api/users/profile/',
  USERS: '/api/users/',
  
  // Strategies
  STRATEGIES: '/api/strategies/',
  STRATEGY_DETAIL: (id) => `/api/strategies/${id}/`,
  
  // Backtests
  BACKTESTS: '/api/backtests/',
  BACKTEST_DETAIL: (id) => `/api/backtests/${id}/`,
  
  // Favorites
  FAVORITES: '/api/favorites/',
  
  // QuantConnect
  QUANTCONNECT_SYNC: '/strategies/sync-quantconnect/',
};

// Helper function to get full URL
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Export default configuration
export default {
  baseURL: API_BASE_URL,
  endpoints: API_ENDPOINTS,
  getUrl: getApiUrl,
};
