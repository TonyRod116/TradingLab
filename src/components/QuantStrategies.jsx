import React, { useState } from 'react';
import { 
  FaChartLine, 
  FaPlay, 
  FaRocket,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaLightbulb
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import QuantConnectService from '../services/QuantConnectService';
import { getApiUrl } from '../config/api';
import './QuantStrategies.css';

const QuantStrategies = () => {

  const [activeSubTab, setActiveSubTab] = useState('natural-language');
  const [loading, setLoading] = useState(false);


  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [parseResults, setParseResults] = useState(null);
  const [compilationStatus, setCompilationStatus] = useState(null);

  // QuantConnect strategy templates
  const strategyTemplates = [
    {
      id: 'rsi-mean-reversion',
      name: 'RSI Mean Reversion',
      description: 'Buy when RSI < 30, sell when RSI > 70',
      symbol: 'SPY',
      indicators: [
        { type: 'RSI', period: 14 }
      ],
      entry_conditions: [
        { type: 'RSI_OVERSOLD', value: 30 }
      ],
      exit_conditions: [
        { type: 'RSI_OVERBOUGHT', value: 70 }
      ]
    },
    {
      id: 'sma-crossover',
      name: 'SMA Crossover',
      description: 'Buy when fast SMA crosses above slow SMA',
      symbol: 'SPY',
      indicators: [
        { type: 'SMA', period: 20 },
        { type: 'SMA', period: 50 }
      ],
      entry_conditions: [
        { type: 'SMA_CROSSOVER_UP', fast_period: 20, slow_period: 50 }
      ],
      exit_conditions: [
        { type: 'SMA_CROSSOVER_DOWN', fast_period: 20, slow_period: 50 }
      ]
    },
    {
      id: 'bollinger-bands',
      name: 'Bollinger Bands',
      description: 'Buy at lower band, sell at upper band',
      symbol: 'SPY',
      indicators: [
        { type: 'BOLLINGER_BANDS', period: 20, std_dev: 2 }
      ],
      entry_conditions: [
        { type: 'PRICE_TOUCH_LOWER_BAND' }
      ],
      exit_conditions: [
        { type: 'PRICE_TOUCH_UPPER_BAND' }
      ]
    },
    {
      id: 'macd-signal',
      name: 'MACD Signal',
      description: 'Buy when MACD crosses above signal line',
      symbol: 'SPY',
      indicators: [
        { type: 'MACD', fast_period: 12, slow_period: 26, signal_period: 9 }
      ],
      entry_conditions: [
        { type: 'MACD_CROSSOVER_UP' }
      ],
      exit_conditions: [
        { type: 'MACD_CROSSOVER_DOWN' }
      ]
    }
  ];









  const handleRunBacktest = async (template) => {
    setLoading(true);
    
    try {
      const result = await QuantConnectService.runCompleteWorkflow(template, template.description);
      
      if (result.success) {
        toast.success('🚀 Backtest started successfully!', {
          position: "top-right",
          autoClose: 3000
        });

      } else {
        toast.error(`❌ Backtest failed: ${result.error}`, {
          position: "top-right",
          autoClose: 5000
        });
      }
    } catch (error) {
      toast.error(`❌ Error: ${error.message}`, {
        position: "top-right",
        autoClose: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleParseNaturalLanguage = async () => {
    if (!naturalLanguageInput.trim()) {
      toast.error('Please enter a strategy description', {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }

    setLoading(true);
    setParseResults(null);
    
    try {
      const response = await fetch(`${getApiUrl('/api/quantconnect/parse-natural-language/')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: naturalLanguageInput
        })
      });

      const result = await response.json();
      setParseResults(result);
      
      if (result.success) {
        toast.success('✅ Strategy parsed successfully!', {
          position: "top-right",
          autoClose: 3000
        });
      } else {
        toast.error(`❌ Parse failed: ${result.error}`, {
          position: "top-right",
          autoClose: 5000
        });
      }
    } catch (error) {
      toast.error(`❌ Error: ${error.message}`, {
        position: "top-right",
        autoClose: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndCompile = async () => {
    if (!naturalLanguageInput.trim()) {
      toast.error('Please enter a strategy description', {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }

    setLoading(true);
    setCompilationStatus(null);
    
    try {
      const response = await fetch(`${getApiUrl('/api/quantconnect/create-and-compile-strategy/')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: naturalLanguageInput,
          project_name: `Strategy_${Date.now()}`
        })
      });

      const result = await response.json();
      setCompilationStatus(result);
      
      if (result.success) {
        toast.success('🚀 Strategy created and compilation started!', {
          position: "top-right",
          autoClose: 3000
        });
        
        // Check compilation status after a delay
        setTimeout(() => {
          handleCheckCompilationStatus(result.project_id, result.compilation_id);
        }, 2000);
      } else {
        toast.error(`❌ Compilation failed: ${result.error}`, {
          position: "top-right",
          autoClose: 5000
        });
      }
    } catch (error) {
      toast.error(`❌ Error: ${error.message}`, {
        position: "top-right",
        autoClose: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckCompilationStatus = async (projectId, compilationId) => {
    try {
      const response = await fetch(`${getApiUrl('/api/quantconnect/read-compilation-result/')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          compilation_id: compilationId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`✅ Compilation ${result.status}!`, {
          position: "top-right",
          autoClose: 3000
        });
      } else {
        toast.error(`❌ Compilation failed: ${result.error}`, {
          position: "top-right",
          autoClose: 5000
        });
      }
    } catch (error) {
      toast.error(`❌ Error checking status: ${error.message}`, {
        position: "top-right",
        autoClose: 5000
      });
    }
  };

  const renderNaturalLanguage = () => (
    <div className="natural-language">
      <div className="natural-language-header">
        <h3><FaLightbulb /> Natural Language Strategy Creator</h3>
        <p>Describe your trading strategy in plain English and we'll convert it to QuantConnect code</p>
      </div>
      
      <div className="natural-language-content">
      
      <div className="strategy-input-section">
        <div className="input-group">
          <label htmlFor="strategy-description">Strategy Description</label>
          <textarea
            id="strategy-description"
            value={naturalLanguageInput}
            onChange={(e) => setNaturalLanguageInput(e.target.value)}
            placeholder="Example: Buy SPY when price above 20-day SMA, sell when RSI overbought above 70"
            rows={4}
            className="strategy-textarea"
          />
        </div>
        
        <div className="example-strategies">
          <h4>💡 Example Strategies:</h4>
          <div className="example-buttons">
            <button 
              className="example-btn"
              onClick={() => setNaturalLanguageInput("Buy SPY when price above 20-day SMA, sell when RSI overbought above 70")}
            >
              RSI + SMA Strategy
            </button>
            <button 
              className="example-btn"
              onClick={() => setNaturalLanguageInput("Trade EUR/USD using VWAP and ATR for the last year on 4-hour timeframe")}
            >
              Forex VWAP Strategy
            </button>
            <button 
              className="example-btn"
              onClick={() => setNaturalLanguageInput("Trade Gold futures using Bollinger Bands during the COVID period")}
            >
              Gold Bollinger Bands
            </button>
            <button 
              className="example-btn"
              onClick={() => setNaturalLanguageInput("Buy Bitcoin when MACD crosses above signal line and volume is above average, sell when price drops 5%")}
            >
              Crypto MACD Strategy
            </button>
          </div>
        </div>
        
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={handleParseNaturalLanguage}
            disabled={loading || !naturalLanguageInput.trim()}
          >
            {loading ? <FaSpinner className="spinning" /> : <FaLightbulb />} Parse Strategy
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleCreateAndCompile}
            disabled={loading || !naturalLanguageInput.trim()}
          >
            {loading ? <FaSpinner className="spinning" /> : <FaRocket />} Create & Compile
          </button>
        </div>
      </div>
      
      {parseResults && (
        <div className={`parse-results ${parseResults.success ? 'success' : 'error'}`}>
          <div className="result-header">
            {parseResults.success ? (
              <FaCheckCircle className="success-icon" />
            ) : (
              <FaExclamationTriangle className="error-icon" />
            )}
            <span className="result-status">
              {parseResults.success ? 'Strategy Parsed Successfully' : 'Parse Failed'}
            </span>
          </div>
          

          
          {parseResults.error && (
            <div className="result-error">
              <strong>Error:</strong> {parseResults.error}
            </div>
          )}
        </div>
      )}
      
      {compilationStatus && (
        <div className={`compilation-status ${compilationStatus.success ? 'success' : 'error'}`}>
          <div className="status-header">
            {compilationStatus.success ? (
              <FaCheckCircle className="success-icon" />
            ) : (
              <FaExclamationTriangle className="error-icon" />
            )}
            <span className="status-text">
              {compilationStatus.success ? 'Compilation Started' : 'Compilation Failed'}
            </span>
          </div>
          
          {compilationStatus.success && (
            <div className="status-details">
              <p><strong>Project ID:</strong> {compilationStatus.project_id}</p>
              <p><strong>Compilation ID:</strong> {compilationStatus.compilation_id}</p>
            </div>
          )}
        </div>
      )}
      
      <div className="capabilities-info">
        <h4>🚀 System Capabilities</h4>
        <div className="capabilities-grid">
          <div className="capability-item">
            <strong>100+ Instruments:</strong> Forex, Futures, Crypto, Equities
          </div>
          <div className="capability-item">
            <strong>50+ Timeframes:</strong> 1m, 5m, 15m, 1h, 4h, 1d, 1w
          </div>
          <div className="capability-item">
            <strong>200+ Indicators:</strong> SMA, EMA, RSI, MACD, VWAP, ATR
          </div>
          <div className="capability-item">
            <strong>100+ Backtest Periods:</strong> Last year, COVID period, 2020-2024
          </div>
        </div>
      </div>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="quant-templates">
      <div className="templates-header">
        <h3><FaRocket /> Quant Templates</h3>
        <p>Choose from proven QuantConnect strategy templates</p>
      </div>
      
      <div className="templates-content">
        <div className="templates-grid">
        {strategyTemplates.map((template) => (
          <div key={template.id} className="template-card">
            <div className="template-header">
              <h4>{template.name}</h4>
              <span className="template-symbol">{template.symbol}</span>
            </div>
            <p className="template-description">{template.description}</p>
            
            <div className="template-indicators">
              <strong>Indicators:</strong>
              <div className="indicators-list">
                {template.indicators.map((indicator, index) => (
                  <span key={index} className="indicator-tag">
                    {indicator.type} {indicator.period && `(${indicator.period})`}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="template-actions">
              <button 
                className="btn btn-primary"
                onClick={() => handleRunBacktest(template)}
                disabled={loading}
              >
                {loading ? <FaSpinner className="spinning" /> : <FaPlay />} Run Backtest
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );






  return (
    <div className="quant-strategies">
      <div className="quant-header">
        <h2><FaChartLine /> QuantConnect Integration</h2>
        <p>Create, test, and deploy algorithmic trading strategies with QuantConnect</p>
      </div>

      <div className="quant-subtabs">
        <button 
          className={`subtab-button ${activeSubTab === 'natural-language' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('natural-language')}
        >
          <FaLightbulb /> Natural Language
        </button>
        <button 
          className={`subtab-button ${activeSubTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('templates')}
        >
          <FaRocket /> Quant Templates
        </button>


      </div>

      <div className="quant-content">
        {activeSubTab === 'natural-language' && renderNaturalLanguage()}
        {activeSubTab === 'templates' && renderTemplates()}
      </div>
    </div>
  );
};

export default QuantStrategies;
