/**
 * QuantConnect API Service
 * Handles authentication and communication with QuantConnect API v2
 * Based on: https://www.quantconnect.com/docs/v2/cloud-platform/api-reference/authentication
 */

class QuantConnectService {
  constructor() {
    // Usar el backend Django en lugar de QuantConnect directamente
    this.baseURL = this.getBaseURL() + '/api/quantconnect';
    this.userId = 414810;
    this.apiToken = '79b91dd67dbbbfa4129888180d2de06d773de7eb4c8df86761bb7926d0d6d8cf';
  }

  /**
   * Get base URL based on environment
   * @returns {string} Base URL for API calls
   */
  getBaseURL() {
    // Check if we're in development (localhost)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    
    // Production URL (Heroku)
    return 'https://tradelab-39583a78c028.herokuapp.com';
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