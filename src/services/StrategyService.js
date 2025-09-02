/**
 * Strategy Service - Simple service to handle strategy operations
 * Uses the backend API for all strategy and backtesting operations
 */

const BASE_URL = 'http://localhost:8000';

class StrategyService {
  constructor() {
    this.baseURL = BASE_URL;
  }

  /**
   * Get authentication token
   * @returns {string} JWT token
   */
  getToken() {
    return localStorage.getItem('access_token');
  }

  /**
   * Create a new strategy
   * @param {Object} strategyData - Strategy data
   * @returns {Promise<Object>} Created strategy
   */
  async createStrategy(strategyData) {
    const token = this.getToken();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(`${this.baseURL}/api/strategies/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(strategyData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
      let errorMessage = `Error creating strategy: ${response.statusText}`;
      try {
        const responseText = await response.text();
        
        // Check if it's an HTML error page (500 error)
        if (responseText.includes('<!DOCTYPE') && responseText.includes('IntegrityError')) {
          if (responseText.includes('duplicate key value violates unique constraint')) {
            errorMessage = 'A strategy with this name already exists. Please choose a different name.';
          } else {
            errorMessage = 'Database error occurred. Please try again.';
          }
        } else if (responseText.includes('no data found') || responseText.includes('No data found')) {
          errorMessage = 'No market data available for ES in this timeframe. The backend may not have data loaded for this symbol.';
        } else if (responseText.includes('FileNotFoundError') || responseText.includes('file not found')) {
          errorMessage = 'Market data files not found. Please check if data is properly loaded in the backend.';
        } else {
          // Try to parse as JSON
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.detail || errorMessage;
        }
      } catch (e) {
        // If response is not JSON (e.g., HTML error page), use status text
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    return await response.json();
    
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: Strategy creation took too long');
      }
      throw error;
    }
  }

  /**
   * Get all strategies
   * @returns {Promise<Array>} Array of strategies
   */
  async getStrategies() {
    const response = await fetch(`${this.baseURL}/api/strategies/`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching strategies: ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Get a specific strategy
   * @param {number} strategyId - Strategy ID
   * @returns {Promise<Object>} Strategy data
   */
  async getStrategy(strategyId) {
    const response = await fetch(`${this.baseURL}/api/strategies/${strategyId}/`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching strategy: ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Update a strategy
   * @param {number} strategyId - Strategy ID
   * @param {Object} strategyData - Updated strategy data
   * @returns {Promise<Object>} Updated strategy
   */
  async updateStrategy(strategyId, strategyData) {
    const response = await fetch(`${this.baseURL}/api/strategies/${strategyId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(strategyData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error updating strategy: ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Delete a strategy
   * @param {number} strategyId - Strategy ID
   * @returns {Promise<void>}
   */
  async deleteStrategy(strategyId) {
    const response = await fetch(`${this.baseURL}/api/strategies/${strategyId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting strategy: ${response.statusText}`);
    }
  }

  /**
   * Run backtest for a strategy
   * @param {number} strategyId - Strategy ID
   * @param {Object} backtestParams - Backtest parameters
   * @returns {Promise<Object>} Backtest results
   */
  async runBacktest(strategyId, backtestParams) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for backtest
    
    try {
      const response = await fetch(`${this.baseURL}/api/strategies/${strategyId}/backtest/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(backtestParams),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
    
    if (!response.ok) {
      let errorMessage = `Backtest failed: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.detail || errorMessage;
      } catch (e) {
        // If response is not JSON (e.g., HTML error page), use status text
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    return await response.json();
    
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: Backtest took too long (60 seconds)');
      }
      throw error;
    }
  }

  /**
   * Get all backtests for a strategy
   * @param {number} strategyId - Strategy ID
   * @returns {Promise<Array>} Array of backtest results
   */
  async getBacktests(strategyId) {
    const response = await fetch(`${this.baseURL}/api/strategies/${strategyId}/backtests/`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching backtests: ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Get latest backtest for a strategy
   * @param {number} strategyId - Strategy ID
   * @returns {Promise<Object>} Latest backtest result
   */
  async getLatestBacktest(strategyId) {
    const response = await fetch(`${this.baseURL}/api/strategies/${strategyId}/latest_backtest/`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching latest backtest: ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Get trades for a specific backtest
   * @param {number} backtestId - Backtest ID
   * @returns {Promise<Array>} Array of trades
   */
  async getBacktestTrades(backtestId) {
    const response = await fetch(`${this.baseURL}/api/strategies/backtest-results/${backtestId}/trades/`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching trades: ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Get performance summary for a specific backtest
   * @param {number} backtestId - Backtest ID
   * @returns {Promise<Object>} Performance summary
   */
  async getPerformanceSummary(backtestId) {
    const response = await fetch(`${this.baseURL}/api/strategies/backtest-results/${backtestId}/performance_summary/`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching performance summary: ${response.statusText}`);
    }
    
    return await response.json();
  }
}

// Create singleton instance
const strategyService = new StrategyService();

export default strategyService;
