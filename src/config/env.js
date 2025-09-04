// Configuración de variables de entorno
export const ENV = {
  // API URLs
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173',
  
  // Environment
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  DEV: import.meta.env.DEV || false,
  PROD: import.meta.env.PROD || false,
  
  // Feature flags
  ENABLE_QUANTCONNECT: true,
  ENABLE_ANALYTICS: false,
  ENABLE_DEBUG: import.meta.env.DEV || false
};

// Configuración específica para desarrollo
export const DEV_CONFIG = {
  API_BASE_URL: 'http://127.0.0.1:8000',
  FRONTEND_URL: 'http://localhost:5173',
  ENABLE_DEBUG: true
};

// Configuración específica para producción
export const PROD_CONFIG = {
  API_BASE_URL: 'https://tradelab-39583a78c028.herokuapp.com',
  FRONTEND_URL: 'https://trading-lab.netlify.app',
  ENABLE_DEBUG: false
};

// Configuración activa basada en el entorno
export const CONFIG = ENV.DEV ? DEV_CONFIG : PROD_CONFIG;
