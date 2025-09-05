/**
 * QuantConnect API Service
 * Handles authentication and communication with QuantConnect API v2
 * Based on: https://www.quantconnect.com/docs/v2/cloud-platform/api-reference/authentication
 */

class QuantConnectService {
  constructor() {
    // Usar el backend Django en lugar de QuantConnect directamente
    this.baseURL = 'http://localhost:8000/api';
    this.token = localStorage.getItem('authToken');
  }

  /**
   * Método principal para ejecutar backtest completo
   * @param {Object} strategyData - Datos de la estrategia
   * @returns {Promise<Object>} Resultado del backtest
   */
  async runCompleteBacktest(strategyData) {
    try {
      // Validar que tengamos los datos requeridos
      if (!strategyData.name) {
        throw new Error('Strategy name is required');
      }
      if (!strategyData.code) {
        throw new Error('Strategy code is required');
      }

      // Preparar el request exactamente como lo espera el backend
      const requestBody = {
        strategy: {
          name: strategyData.name,
          lean_code: strategyData.code
        }
      };

      console.log('🚀 Sending QuantConnect backtest request:');
      console.log('📡 URL:', `${this.baseURL}/strategies/quantconnect-backtest/`);
      console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));
      console.log('📝 Strategy name:', strategyData.name);
      console.log('🐍 Code length:', strategyData.code?.length || 0);

      const response = await fetch(`${this.baseURL}/strategies/quantconnect-backtest/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Backend response:', result);
      
      // Adaptar la respuesta al formato esperado por el frontend
      return {
        success: result.success,
        results: {
          project_id: result.project_id,
          compile_id: null, // No disponible en la nueva API
          backtest_id: result.backtest_id,
          final_results: {
            statistics: result.results?.statistics || {}
          }
        },
        error: result.error || null
      };
    } catch (error) {
      console.error('Error running backtest:', error);
      throw error;
    }
  }

  /**
   * Método para operaciones individuales
   * @param {string} action - Acción a ejecutar
   * @param {Object} data - Datos para la acción
   * @returns {Promise<Object>} Resultado de la operación
   */
  async executeAction(action, data) {
    try {
      const response = await fetch(`${this.baseURL}/quantconnect/direct/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: action,
          ...data
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error executing ${action}:`, error);
      throw error;
    }
  }

  /**
   * Método para monitoreo en tiempo real
   * @param {string} type - Tipo de monitoreo (compilation o backtest)
   * @param {string} projectId - ID del proyecto
   * @param {string} id - ID de compilación o backtest
   * @returns {Promise<Object>} Estado del monitoreo
   */
  async monitor(type, projectId, id) {
    try {
      const params = new URLSearchParams({
        type: type,
        project_id: projectId,
        [type === 'compilation' ? 'compile_id' : 'backtest_id']: id
      });

      const response = await fetch(`${this.baseURL}/quantconnect/monitor/?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error monitoring:', error);
      throw error;
    }
  }

  /**
   * Verificar salud del servicio
   * @returns {Promise<Object>} Estado del servicio
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/quantconnect/health/`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Simple SHA-256 implementation for browser compatibility
   * @param {string} message - Message to hash
   * @returns {string} SHA-256 hash
   */
  async sha256(message) {
    try {
      // Try using crypto.subtle first (modern browsers)
      if (crypto && crypto.subtle) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } else {
        // Fallback: use a simple hash (not cryptographically secure, but works for testing)

        return this.simpleHash(message);
      }
    } catch (error) {

      return this.simpleHash(message);
    }
  }

  /**
   * Simple hash function as fallback
   * @param {string} str - String to hash
   * @returns {string} Hash
   */
  simpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash.toString(16);
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Generate QuantConnect authentication headers
   * @returns {Promise<Object>} Headers with authentication
   */
  async generateAuthHeaders() {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const timeStampedToken = `${this.apiToken}:${timestamp}`;
    
    try {
      // Create SHA-256 hash
      const hashHex = await this.sha256(timeStampedToken);
      
      const authentication = btoa(`${this.userId}:${hashHex}`);
      
      return {
        'Authorization': `Basic ${authentication}`,
        'Timestamp': timestamp,
        'Content-Type': 'application/json'
      };
    } catch (error) {
      console.error('Error generating auth headers:', error);
      throw new Error('Failed to generate authentication headers');
    }
  }

  /**
   * Test QuantConnect authentication via Django backend
   * @returns {Promise<Object>} Authentication result
   */
  async testAuthentication() {
    try {

      
      const response = await fetch(`${this.baseURL}/test-auth/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      const result = await response.json();


      return {
        success: response.ok && result.success,
        data: result,
        status: response.status,
        error: response.ok ? null : result.error || 'Authentication failed'
      };
    } catch (error) {
      console.error('QuantConnect authentication error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a new project in QuantConnect via Django backend
   * @param {string} name - Project name
   * @param {string} language - Programming language (CSharp or Python)
   * @returns {Promise<Object>} Project creation result
   */
  async createProject(name, language = 'Python') {
    try {

      
      const response = await fetch(`${this.baseURL}/create-project/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          language: language
        })
      });

      const result = await response.json();


      return {
        success: response.ok && result.success,
        data: result,
        status: response.status,
        error: response.ok ? null : result.error || 'Project creation failed'
      };
    } catch (error) {
      console.error('Project creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test project creation via Django backend
   * @returns {Promise<Object>} Test result
   */
  async testProjectCreation() {
    try {

      
      const response = await fetch(`${this.baseURL}/test-project/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      const result = await response.json();


      return {
        success: response.ok && result.success,
        data: result,
        status: response.status,
        error: response.ok ? null : result.error || 'Project creation test failed'
      };
    } catch (error) {
      console.error('Project creation test error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Run complete backtest workflow via Django backend
   * @param {Object} strategyJson - Strategy configuration
   * @param {string} description - Strategy description
   * @returns {Promise<Object>} Complete workflow result
   */
  async runCompleteWorkflow(strategyJson, description) {
    try {

      
      const response = await fetch(`${this.baseURL}/run-backtest/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          strategy: strategyJson,
          description: description
        })
      });

      const result = await response.json();


      return {
        success: response.ok && result.success,
        data: result,
        status: response.status,
        error: response.ok ? null : result.error || 'Backtest workflow failed'
      };
    } catch (error) {
      console.error('Backtest workflow error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate Python code from strategy JSON
   * @param {Object} strategyJson - Strategy configuration
   * @param {string} description - Strategy description
   * @returns {string} Python code
   */
  generatePythonCode(strategyJson, description) {
    const symbol = strategyJson.symbol || 'SPY';
    const indicators = strategyJson.indicators || [];
    const entryConditions = strategyJson.entry_conditions || [];
    const exitConditions = strategyJson.exit_conditions || [];

    let code = `# QuantConnect Algorithm
# Generated from: "${description}"

from AlgorithmImports import *

class TradeLabStrategy(QCAlgorithm):
    def Initialize(self):
        self.SetStartDate(2020, 1, 1)  # Start date
        self.SetEndDate(2023, 12, 31)  # End date
        self.SetCash(100000)  # Starting cash
        
        # Add data
        self.symbol = self.AddEquity("${symbol}", Resolution.Daily).Symbol
        
        # Initialize indicators
`;

    // Add indicators
    indicators.forEach(indicator => {
      if (indicator.type === 'RSI') {
        code += `        self.rsi = self.RSI(self.symbol, ${indicator.period || 14}, MovingAverageType.Simple)\n`;
      } else if (indicator.type === 'SMA') {
        code += `        self.sma_${indicator.period} = self.SMA(self.symbol, ${indicator.period}, Resolution.Daily)\n`;
      } else if (indicator.type === 'EMA') {
        code += `        self.ema_${indicator.period} = self.EMA(self.symbol, ${indicator.period}, Resolution.Daily)\n`;
      }
    });

    code += `
        # Set warm-up period
        self.SetWarmUp(50)
        
        # Track position
        self.is_invested = False

    def OnData(self, data):
        if self.IsWarmingUp:
            return
            
        if not data.ContainsKey(self.symbol):
            return
`;

    // Add entry conditions
    if (entryConditions.length > 0) {
      code += `
        # Entry conditions
        if not self.is_invested:`;
      
      entryConditions.forEach(condition => {
        if (condition.type === 'RSI_OVERSOLD') {
          code += `
            if self.rsi.Current.Value < ${condition.value || 30}:`;
        } else if (condition.type === 'PRICE_ABOVE_SMA') {
          code += `
            if data[self.symbol].Price > self.sma_${condition.period || 20}.Current.Value:`;
        }
      });
      
      code += `
                self.SetHoldings(self.symbol, 1.0)
                self.is_invested = True
                self.Debug(f"Entered position at {data[self.symbol].Price}")`;
    }

    // Add exit conditions
    if (exitConditions.length > 0) {
      code += `
        # Exit conditions
        if self.is_invested:`;
      
      exitConditions.forEach(condition => {
        if (condition.type === 'RSI_OVERBOUGHT') {
          code += `
            if self.rsi.Current.Value > ${condition.value || 70}:`;
        } else if (condition.type === 'PRICE_BELOW_SMA') {
          code += `
            if data[self.symbol].Price < self.sma_${condition.period || 20}.Current.Value:`;
        }
      });
      
      code += `
                self.Liquidate(self.symbol)
                self.is_invested = False
                self.Debug(f"Exited position at {data[self.symbol].Price}")`;
    }

    code += `
    
    def OnEndOfAlgorithm(self):
        self.Debug("Algorithm completed")`;

    return code;
  }
}

export default new QuantConnectService();