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
  
  // Nuevos endpoints de QuantConnect según la guía
  QUANTCONNECT_COMPLETE_FLOW: `${API_BASE_URL}/api/quantconnect/complete-flow/`,
  QUANTCONNECT_DIRECT: `${API_BASE_URL}/api/quantconnect/direct/`,
  QUANTCONNECT_MONITOR: `${API_BASE_URL}/api/quantconnect/monitor/`,
  
  // Backtest endpoints
  COMPILE_PROJECT: `${API_BASE_URL}/api/quantconnect/compile-project/`,
  READ_COMPILATION: `${API_BASE_URL}/api/quantconnect/read-compilation-result/`,
  RUN_BACKTEST: `${API_BASE_URL}/api/backtests/`,
  QUANTCONNECT_BACKTEST: `${API_BASE_URL}/api/strategies/quantconnect-backtest/`,
  QUANTCONNECT_PROGRESS: `${API_BASE_URL}/api/strategies/quantconnect-progress/`,
  BACKTEST_RESULTS: (id) => `${API_BASE_URL}/api/backtest/results/${id}/`,
  BACKTEST_HISTORY: `${API_BASE_URL}/api/backtest/history/`,
  
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
};

// Debug: Log the PARSE_STRATEGY endpoint
console.log('🔧 PARSE_STRATEGY endpoint:', API_ENDPOINTS.PARSE_STRATEGY);
console.log('🔧 PROFILE endpoint:', API_ENDPOINTS.PROFILE);

// Configuración de headers por defecto
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Función para obtener el token de autenticación
const getAuthToken = () => {
  // Verificar diferentes posibles nombres de token
  const possibleTokens = ['access_token', 'token', 'auth_token', 'jwt_token'];
  let token = null;
  
  for (const tokenName of possibleTokens) {
    const foundToken = localStorage.getItem(tokenName);
    if (foundToken) {
      console.log(`🔑 Found token with key '${tokenName}':`, foundToken ? 'Yes' : 'No');
      token = foundToken;
      break;
    }
  }
  
  if (!token) {
    console.log('🔑 No token found in localStorage with any of these keys:', possibleTokens);
    console.log('🔑 Available localStorage keys:', Object.keys(localStorage));
  }
  
  return token;
};

// Función para verificar si el token es válido
const isTokenValid = () => {
  const token = getAuthToken();
  if (!token) {
    console.log('🔑 No token found in localStorage');
    return false;
  }
  
  try {
    // Verificar si es un JWT válido (debe tener 3 partes separadas por puntos)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('🔑 Token is not a valid JWT format');
      return false;
    }
    
    const tokenData = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000); // Convertir a segundos
    const isValid = tokenData.exp > now;
    console.log('🔑 Token valid:', isValid, 'Expires:', new Date(tokenData.exp * 1000));
    console.log('🔑 Current time:', new Date(now * 1000));
    console.log('🔑 Token data:', tokenData);
    return isValid;
  } catch (error) {
    console.error('🔑 Error parsing token:', error);
    console.log('🔑 Token value:', token);
    return false;
  }
};

// Función para crear headers con autenticación
export const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    ...DEFAULT_HEADERS,
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
  console.log('🔑 Headers with auth:', headers);
  return headers;
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
  
  // Verificar token antes de hacer la petición
  const tokenValid = isTokenValid();
  const token = getAuthToken();
  
  if (!tokenValid && token) {
    console.log('🔑 Token validation failed but token exists - proceeding with token anyway');
  }
  
  const config = {
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  };

  console.log('🌐 Making API request to:', url);
  console.log('🌐 Request config:', config);
  console.log('🌐 Token valid:', tokenValid);

  try {
    const response = await fetch(url, config);
    
    console.log('🌐 Response status:', response.status);
    console.log('🌐 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🌐 Error response body:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('🌐 Response data:', data);
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
      start_date: '2025-05-01',
      end_date: '2025-05-16',
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
  },

  // Ejecutar flujo completo de QuantConnect
  runCompleteFlow: async (data) => {
    return apiRequest(API_ENDPOINTS.QUANTCONNECT_COMPLETE_FLOW, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Verificar progreso del backtest
  checkProgress: async (projectId, backtestId) => {
    return apiRequest(`${API_ENDPOINTS.QUANTCONNECT_MONITOR}?type=backtest&project_id=${projectId}&backtest_id=${backtestId}`, {
      method: 'GET'
    });
  }
       };

       // Funciones para AI y conversión de estrategias
       export const strategyAPI = {
         // Crear nueva estrategia
         createStrategy: async (strategyData) => {
           return apiRequest(API_ENDPOINTS.STRATEGIES, {
             method: 'POST',
             body: JSON.stringify(strategyData)
           });
         },

         // Obtener estrategia por ID
         getStrategy: async (strategyId) => {
           return apiRequest(API_ENDPOINTS.STRATEGY_DETAIL(strategyId), {
             method: 'GET'
           });
         },

                 // Convertir lenguaje natural a estrategia completa (detección automática de idioma)
        naturalLanguageToStrategy: async (description) => {
          return apiRequest(API_ENDPOINTS.NL_TO_STRATEGY, {
            method: 'POST',
            body: JSON.stringify({ text: description })
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
         },

         // Obtener estado de QuantConnect para una estrategia
         getQuantConnectStatus: async (strategyId) => {
           return apiRequest(`${API_ENDPOINTS.STRATEGY_DETAIL(strategyId)}qc-status/`, {
             method: 'GET'
           });
         }
       };

             // Funciones para backtesting
      export const backtestAPI = {
        // Ejecutar backtest
        runBacktest: async (backtestData) => {
          return apiRequest(API_ENDPOINTS.RUN_BACKTEST, {
            method: 'POST',
            body: JSON.stringify(backtestData)
          });
        },

        // Ejecutar backtest con QuantConnect
        runQuantConnectBacktest: async (strategyData, backtestParams) => {
          // Importar el generador de código LEAN
          const { generateLeanCode } = await import('../utils/leanCodeGenerator.js');
          
          // Generar código LEAN completo
          const leanCode = generateLeanCode(strategyData, backtestParams);
          
          // Estructura que espera el backend
          const requestData = {
            strategy: {
              id: strategyData.id,
              name: strategyData.name || 'QuantConnect Backtest',
              lean_code: leanCode
            },
            backtest_params: {
              start_date: backtestParams.startDate || backtestParams.start_date,
              end_date: backtestParams.endDate || backtestParams.end_date,
              initial_capital: backtestParams.initialCapital || backtestParams.initial_capital
            }
          };
          
          console.log('🚀 Sending to QuantConnect Backend:', requestData);
          console.log('🚀 Generated LEAN Code:', leanCode);
          
          return apiRequest(API_ENDPOINTS.QUANTCONNECT_BACKTEST, {
            method: 'POST',
            body: JSON.stringify(requestData)
          });
        },

        // Obtener resultados de backtest
        getBacktestResults: async (backtestId) => {
          return apiRequest(API_ENDPOINTS.BACKTEST_RESULTS(backtestId));
        },

        // Obtener historial de backtests
        getBacktestHistory: async () => {
          return apiRequest(API_ENDPOINTS.BACKTEST_HISTORY);
        },

          // Eliminar todos los backtests
  deleteAllBacktests: async () => {
    return apiRequest(API_ENDPOINTS.DELETE_ALL_BACKTESTS, {
      method: 'DELETE'
    });
  },
  
  // Consultar progreso del backtest
  checkProgress: async (projectId, backtestId) => {
    return apiRequest(`${API_ENDPOINTS.QUANTCONNECT_PROGRESS}?project_id=${projectId}&backtest_id=${backtestId}`, {
      method: 'GET'
    });
  }
      };

       export { API_BASE_URL };
       export default API_BASE_URL;