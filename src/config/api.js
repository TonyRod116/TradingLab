// Configuración de la API
import { CONFIG } from './env.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || CONFIG.API_BASE_URL;
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || CONFIG.FRONTEND_URL;

// Debug: Log the API_BASE_URL to console
console.log('🔧 API_BASE_URL:', API_BASE_URL);
console.log('🔧 CONFIG.API_BASE_URL:', CONFIG.API_BASE_URL);
console.log('🔧 VITE_API_URL:', import.meta.env.VITE_API_URL);

// Real API endpoints - no mock data needed

// Endpoints de la API
export const API_ENDPOINTS = {
  // QuantConnect endpoints
  PARSE_STRATEGY: `${API_BASE_URL}/api/quantconnect/parse-natural-language/`,
  STRATEGY_TEMPLATES: `${API_BASE_URL}/api/quantconnect/strategy-templates/`,
  FAVORITES: `${API_BASE_URL}/api/quantconnect/favorites/`,
  HEALTH: `${API_BASE_URL}/api/quantconnect/health/`,
  
  // Backtest endpoints
  COMPILE_PROJECT: `${API_BASE_URL}/api/quantconnect/compile-project/`,
  READ_COMPILATION: `${API_BASE_URL}/api/quantconnect/read-compilation-result/`,
  RUN_BACKTEST: `${API_BASE_URL}/api/quantconnect/run-backtest/`,
  
  // Legacy endpoints (para compatibilidad)
  STRATEGIES: `${API_BASE_URL}/api/strategies/`,
  STRATEGY_DETAIL: (id) => `${API_BASE_URL}/api/strategies/${id}/`,
  USERS: `${API_BASE_URL}/api/users/`,
  PROFILE: `${API_BASE_URL}/api/users/profile/`,
  AUTH: `${API_BASE_URL}/api/auth/`,
  
  // AI and Strategy Conversion endpoints
  NL_TO_STRATEGY: `${API_BASE_URL}/api/strategies/nl-to-strategy/`,
  NL_TO_DSL: `${API_BASE_URL}/api/strategies/nl-to-dsl/`,
  DSL_TO_LEAN: `${API_BASE_URL}/api/strategies/dsl-to-lean/`,
  NL_TO_LEAN: `${API_BASE_URL}/api/strategies/nl-to-lean/`,
  
  // Backtesting endpoints
  RUN_BACKTEST: `${API_BASE_URL}/api/backtest/run/`,
  BACKTEST_RESULTS: (id) => `${API_BASE_URL}/api/backtest/results/${id}/`,
  BACKTEST_HISTORY: `${API_BASE_URL}/api/backtest/history/`,
};

// Debug: Log the PARSE_STRATEGY endpoint
console.log('🔧 PARSE_STRATEGY endpoint:', API_ENDPOINTS.PARSE_STRATEGY);
console.log('🔧 PROFILE endpoint:', API_ENDPOINTS.PROFILE);

// Configuración de headers por defecto
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Función para obtener URL de la API (para compatibilidad)
export const getApiUrl = (endpoint) => {
  if (typeof endpoint === 'string') {
    return endpoint;
  }
  return endpoint;
};

// Función para hacer requests a la API
export const apiRequest = async (endpoint, options = {}) => {
  const url = typeof endpoint === 'string' ? endpoint : endpoint;
  
  const config = {
    headers: {
      ...DEFAULT_HEADERS,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Funciones específicas para QuantConnect
export const quantConnectAPI = {
  // Parsear estrategia desde lenguaje natural
  parseStrategy: async (description, backtestParams = {}) => {
    const defaultParams = {
      initial_capital: 100000,
      start_date: '2021-01-01',
      end_date: '2024-01-01',
      benchmark: 'SPY'
    };
    
    return apiRequest(API_ENDPOINTS.PARSE_STRATEGY, {
      method: 'POST',
      body: JSON.stringify({
        description,
        backtest_params: { ...defaultParams, ...backtestParams }
      })
    });
  },

  // Obtener templates de estrategias
  getTemplates: async () => {
    return apiRequest(API_ENDPOINTS.STRATEGY_TEMPLATES);
  },

  // Obtener favoritos
  getFavorites: async () => {
    return apiRequest(API_ENDPOINTS.FAVORITES);
  },

  // Agregar a favoritos
  addToFavorites: async (strategyData) => {
    return apiRequest(API_ENDPOINTS.FAVORITES, {
      method: 'POST',
      body: JSON.stringify(strategyData)
    });
  },

  // Eliminar de favoritos
  removeFromFavorites: async (strategyId) => {
    return apiRequest(`${API_ENDPOINTS.FAVORITES}${strategyId}/`, {
      method: 'DELETE'
    });
  },

  // Health check
  healthCheck: async () => {
    return apiRequest(API_ENDPOINTS.HEALTH);
  },

  // Compilar proyecto
  compileProject: async (projectData) => {
    return apiRequest(API_ENDPOINTS.COMPILE_PROJECT, {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
  },

  // Leer resultado de compilación
  readCompilationResult: async (compileId) => {
    return apiRequest(API_ENDPOINTS.READ_COMPILATION, {
      method: 'POST',
      body: JSON.stringify({ compileId })
    });
  },

           // Ejecutar backtest
         runBacktest: async (projectId) => {
           return apiRequest(API_ENDPOINTS.RUN_BACKTEST, {
             method: 'POST',
             body: JSON.stringify({ projectId })
           });
         }
       };

       // Funciones para AI y conversión de estrategias
       export const strategyAPI = {
         // Convertir lenguaje natural a estrategia completa
         naturalLanguageToStrategy: async (description, language = 'es') => {
           return apiRequest(API_ENDPOINTS.NL_TO_STRATEGY, {
             method: 'POST',
             body: JSON.stringify({ description, language })
           });
         },

         // Convertir lenguaje natural a DSL
         naturalLanguageToDSL: async (description, language = 'es') => {
           return apiRequest(API_ENDPOINTS.NL_TO_DSL, {
             method: 'POST',
             body: JSON.stringify({ description, language })
           });
         },

         // Convertir DSL a código Lean
         dslToLean: async (dslCode) => {
           return apiRequest(API_ENDPOINTS.DSL_TO_LEAN, {
             method: 'POST',
             body: JSON.stringify({ dsl_code: dslCode })
           });
         },

         // Conversión completa: NL → DSL → Lean
         naturalLanguageToLean: async (description, language = 'es') => {
           return apiRequest(API_ENDPOINTS.NL_TO_LEAN, {
             method: 'POST',
             body: JSON.stringify({ description, language })
           });
         }
       };

       // Funciones para backtesting
       export const backtestAPI = {
         // Ejecutar backtest
         runBacktest: async (strategyId, startDate, endDate, initialCapital) => {
           return apiRequest(API_ENDPOINTS.RUN_BACKTEST, {
             method: 'POST',
             body: JSON.stringify({
               strategy_id: strategyId,
               start_date: startDate,
               end_date: endDate,
               initial_capital: initialCapital
             })
           });
         },

         // Obtener resultados de backtest
         getBacktestResults: async (backtestId) => {
           return apiRequest(API_ENDPOINTS.BACKTEST_RESULTS(backtestId));
         },

         // Obtener historial de backtests
         getBacktestHistory: async () => {
           return apiRequest(API_ENDPOINTS.BACKTEST_HISTORY);
         }
       };

       export { API_BASE_URL };
       export default API_BASE_URL;