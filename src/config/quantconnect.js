// Configuración de QuantConnect
export const QUANTCONNECT_CONFIG = {
  // URL base de la API
  API_BASE_URL: 'http://localhost:8000/api',
  
  // Endpoints específicos de QuantConnect
  ENDPOINTS: {
    COMPLETE_FLOW: '/quantconnect/complete-flow/',
    DIRECT: '/quantconnect/direct/',
    MONITOR: '/quantconnect/monitor/',
    HEALTH: '/quantconnect/health/'
  },
  
  // Configuración de monitoreo
  MONITORING: {
    COMPILATION_POLL_INTERVAL: 2000, // 2 segundos
    BACKTEST_POLL_INTERVAL: 5000,    // 5 segundos
    MAX_POLLING_TIME: 600000         // 10 minutos
  },
  
  // Estados del flujo de trabajo
  WORKFLOW_STATES: {
    IDLE: 'idle',
    CREATING_PROJECT: 'creating_project',
    CREATING_FILE: 'creating_file',
    COMPILING: 'compiling',
    COMPILATION_WAITING: 'compilation_waiting',
    RUNNING_BACKTEST: 'running_backtest',
    BACKTEST_WAITING: 'backtest_waiting',
    COMPLETED: 'completed',
    ERROR: 'error'
  },
  
  // Configuración de UI
  UI: {
    PROGRESS_BAR_HEIGHT: '8px',
    STATUS_DOT_SIZE: '12px',
    ANIMATION_DURATION: '0.3s'
  }
};

// Función para obtener la URL completa de un endpoint
export const getQuantConnectEndpoint = (endpoint) => {
  return `${QUANTCONNECT_CONFIG.API_BASE_URL}${QUANTCONNECT_CONFIG.ENDPOINTS[endpoint]}`;
};

// Función para obtener el token de autenticación
export const getQuantConnectToken = () => {
  return localStorage.getItem('authToken');
};

// Función para crear headers de autenticación
export const getQuantConnectHeaders = () => {
  const token = getQuantConnectToken();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export default QUANTCONNECT_CONFIG;
