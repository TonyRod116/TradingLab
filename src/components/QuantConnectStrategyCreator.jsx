import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaChevronRight, FaChevronLeft, FaCog, FaShieldAlt, FaShoppingCart, FaMoneyBillWave, FaSpinner, FaRocket, FaLightbulb, FaCheckCircle, FaExclamationTriangle, FaCode, FaLanguage, FaEye, FaPlay } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { strategyAPI, backtestAPI } from '../config/api';
import RuleBuilder from './RuleBuilder';
import './StrategyCreator.css';
import './RuleBuilder.css';

const QuantConnectStrategyCreator = ({ onStrategyCreated, onBack, template }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estado del flujo de pasos
  const [currentStep, setCurrentStep] = useState(1);
  const [strategyMethod, setStrategyMethod] = useState(null); // 'rule-builder' o 'natural-language'
  const [strategyDefinition, setStrategyDefinition] = useState(null); // 'rule-builder' o 'natural-language'
  
  // Estado de la estrategia
  const [strategyData, setStrategyData] = useState({
    name: '',
    description: '',
    symbol: 'SPY',
    timeframe: '1d',
    initialCapital: 100000,
    startDate: '2021-01-01',
    endDate: '2024-01-01',
    benchmark: 'SPY'
  });

  // Estado para método de reglas
  const [ruleData, setRuleData] = useState({
    entryRules: [],
    exitRules: [],
    conditions: []
  });

  // Estado para lenguaje natural
  const [naturalLanguageData, setNaturalLanguageData] = useState({
    description: '',
    language: 'es'
  });

  // Estado de procesamiento
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [strategyId, setStrategyId] = useState(null);
  const [backtestId, setBacktestId] = useState(null);
  const [backtestResults, setBacktestResults] = useState(null);

  // Configuración de pasos
  const steps = [
    { id: 1, name: 'Basic Information', icon: FaCog, description: 'Strategy name, description, and timeframe' },
    { id: 2, name: 'Trading Parameters', icon: FaShieldAlt, description: 'Symbol, capital, and backtest period' },
    { id: 3, name: 'Strategy Description', icon: FaLightbulb, description: 'Describe your strategy in natural language' },
    { id: 4, name: 'Parse & Compile', icon: FaRocket, description: 'Convert to QuantConnect code and compile' },
    { id: 5, name: 'Backtest Results', icon: FaMoneyBillWave, description: 'Review results and save strategy' }
  ];

  // Inicializar con template si existe
  useEffect(() => {
    if (template) {
      setStrategyData(prev => ({
        ...prev,
        name: template.name || '',
        description: template.description || '',
        symbol: template.symbol || 'SPY'
      }));
    }
  }, [template]);

  const handleInputChange = (field, value) => {
    setStrategyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: // Basic Information
        return strategyData.name.trim() && strategyData.description.trim();
      case 2: // Trading Parameters
        return strategyData.symbol && strategyData.initialCapital > 0;
      case 3: // Strategy Method Selection
        return strategyMethod !== null;
      case 4: // Strategy Definition
        return strategyDefinition !== null;
      case 5: // Summary & Review
        return true;
      default:
        return false;
    }
  };

  const handleRunBacktest = async () => {
    if (!canProceedToNext()) return;
    
    setIsProcessing(true);
    try {
      // Aquí iría la lógica para ejecutar el backtest
      console.log('Running backtest with:', strategyData);
      toast.success('Backtest iniciado correctamente');
    } catch (error) {
      console.error('Error running backtest:', error);
      toast.error('Error al ejecutar el backtest');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStrategyMethodSelect = (method) => {
    setStrategyMethod(method);
    setStrategyDefinition(method); // Por defecto, usar el mismo método para la definición
  };

  const handleStrategyDefinitionSelect = (method) => {
    setStrategyDefinition(method);
  };

  const handleNaturalLanguageChange = (description) => {
    setNaturalLanguageData(prev => ({
      ...prev,
      description
    }));
  };

  const handleRuleChange = (ruleType, rules) => {
    setRuleData(prev => ({
      ...prev,
      [ruleType]: rules
    }));
  };

  const processStrategy = async () => {
    setIsProcessing(true);
    try {
      let result;
      
      if (strategyDefinition === 'natural-language') {
        // Usar GPT para convertir lenguaje natural a estrategia
        result = await strategyAPI.naturalLanguageToStrategy(
          naturalLanguageData.description,
          naturalLanguageData.language
        );
      } else {
        // Usar Rule Builder (implementar lógica de conversión)
        result = await convertRuleBuilderToStrategy();
      }

      if (result.success) {
        setGeneratedCode(result.lean_code || result.python_code);
        setStrategyId(result.strategy_id);
        toast.success('Strategy processed successfully!');
      } else {
        throw new Error(result.error || 'Failed to process strategy');
      }
    } catch (error) {
      console.error('Error processing strategy:', error);
      toast.error(`Error processing strategy: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const convertRuleBuilderToStrategy = async () => {
    // Convertir reglas del Rule Builder a código QuantConnect
    // Esta función se implementaría para convertir las reglas a código
    return {
      success: true,
      strategy_id: `strategy_${Date.now()}`,
      lean_code: '// Generated from Rule Builder\n// Implementation needed'
    };
  };

  const runBacktest = async () => {
    if (!strategyId) {
      toast.error('No strategy ID available for backtest');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await backtestAPI.runBacktest(
        strategyId,
        strategyData.startDate,
        strategyData.endDate,
        strategyData.initialCapital
      );

      if (result.success) {
        setBacktestId(result.backtest_id);
        toast.success('Backtest started successfully!');
        
        // Simular obtención de resultados (en producción sería polling)
        setTimeout(async () => {
          try {
            const results = await backtestAPI.getBacktestResults(result.backtest_id);
            setBacktestResults(results);
            toast.success('Backtest completed!');
          } catch (error) {
            console.error('Error getting backtest results:', error);
          }
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to run backtest');
      }
    } catch (error) {
      console.error('Error running backtest:', error);
      toast.error(`Error running backtest: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveStrategy = async () => {
    try {
      // Implementar guardado de estrategia
      toast.success('Strategy saved successfully!');
      if (onStrategyCreated) {
        onStrategyCreated();
      }
    } catch (error) {
      console.error('Error saving strategy:', error);
      toast.error('Error saving strategy');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInformation();
      case 2:
        return renderTradingParameters();
      case 3:
        return renderStrategyMethodSelection();
      case 4:
        return renderStrategyDefinition();
      case 5:
        return renderSummaryReview();
      default:
        return null;
    }
  };

  const renderBasicInformation = () => (
    <div className="step-content">
      <h3>Basic Information</h3>
      <p>Enter the basic details for your trading strategy</p>
      
      <div className="form-group">
        <label>Strategy Name</label>
        <input
          type="text"
          value={strategyData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter strategy name"
          required
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={strategyData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe your strategy"
          rows={4}
          required
        />
      </div>

      <div className="form-group">
        <label>Timeframe</label>
        <select
          value={strategyData.timeframe}
          onChange={(e) => handleInputChange('timeframe', e.target.value)}
        >
          <option value="1m">1 Minute</option>
          <option value="5m">5 Minutes</option>
          <option value="15m">15 Minutes</option>
          <option value="1h">1 Hour</option>
          <option value="1d">1 Day</option>
        </select>
      </div>
    </div>
  );

  const renderTradingParameters = () => (
    <div className="step-content">
      <h3>Trading Parameters</h3>
      <p>Configure the trading parameters for your strategy</p>
      
      <div className="form-group">
        <label>Symbol</label>
        <input
          type="text"
          value={strategyData.symbol}
          onChange={(e) => handleInputChange('symbol', e.target.value)}
          placeholder="e.g., SPY, AAPL, BTCUSD"
          required
        />
      </div>

      <div className="form-group">
        <label>Initial Capital</label>
        <input
          type="number"
          value={strategyData.initialCapital}
          onChange={(e) => handleInputChange('initialCapital', parseInt(e.target.value))}
          placeholder="100000"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            value={strategyData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            value={strategyData.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Benchmark</label>
        <input
          type="text"
          value={strategyData.benchmark}
          onChange={(e) => handleInputChange('benchmark', e.target.value)}
          placeholder="e.g., SPY"
          required
        />
      </div>
    </div>
  );

  const renderStrategyMethodSelection = () => (
    <div className="step-content">
      <h3>Strategy Method Selection</h3>
      <p>Choose how you want to define your trading strategy</p>
      
      <div className="method-selection">
        <div 
          className={`method-card ${strategyMethod === 'rule-builder' ? 'selected' : ''}`}
          onClick={() => handleStrategyMethodSelect('rule-builder')}
        >
          <div className="method-icon">
            <FaCog />
          </div>
          <h4>Rule Builder</h4>
          <p>Use our visual rule builder to create entry and exit conditions</p>
          <div className="method-features">
            <span>• Visual interface</span>
            <span>• Predefined indicators</span>
            <span>• Drag & drop</span>
          </div>
        </div>

        <div 
          className={`method-card ${strategyMethod === 'natural-language' ? 'selected' : ''}`}
          onClick={() => handleStrategyMethodSelect('natural-language')}
        >
          <div className="method-icon">
            <FaLanguage />
          </div>
          <h4>Natural Language</h4>
          <p>Describe your strategy in plain English and let AI convert it to code</p>
          <div className="method-features">
            <span>• AI-powered</span>
            <span>• Natural language</span>
            <span>• Advanced strategies</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStrategyDefinition = () => (
    <div className="step-content">
      <h3>Strategy Definition</h3>
      <p>Define your strategy using the selected method</p>
      
      {strategyDefinition === 'natural-language' ? (
        <div className="natural-language-section">
          <div className="form-group">
            <label>Strategy Description</label>
            <textarea
              value={naturalLanguageData.description}
              onChange={(e) => handleNaturalLanguageChange(e.target.value)}
              placeholder="Describe your strategy in natural language. For example: 'Buy SPY when RSI is below 30 and price is above 20-day SMA, sell when RSI is above 70'"
              rows={6}
              required
            />
          </div>

          <div className="form-group">
            <label>Language</label>
            <select
              value={naturalLanguageData.language}
              onChange={(e) => setNaturalLanguageData(prev => ({ ...prev, language: e.target.value }))}
            >
              <option value="es">Spanish</option>
              <option value="en">English</option>
            </select>
          </div>

          <button 
            className="btn btn-primary process-btn"
            onClick={processStrategy}
            disabled={!naturalLanguageData.description || isProcessing}
          >
            {isProcessing ? (
              <>
                <FaSpinner className="spinner" />
                Processing with AI...
              </>
            ) : (
              <>
                <FaLightbulb />
                Process with AI
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="rule-builder-section">
          <RuleBuilder 
            onRulesChange={handleRuleChange}
            initialRules={ruleData}
          />
          
          <div className="rule-builder-actions">
            <button 
              className="btn btn-primary process-btn"
              onClick={processStrategy}
              disabled={isProcessing || (!ruleData.entryRules.length && !ruleData.exitRules.length)}
            >
              {isProcessing ? (
                <>
                  <FaSpinner className="spinner" />
                  Processing...
                </>
              ) : (
                <>
                  <FaRocket />
                  Parse & Compile
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {generatedCode && (
        <div className="generated-code">
          <h4>Generated Code</h4>
          <pre>{generatedCode}</pre>
        </div>
      )}
    </div>
  );

  const renderSummaryReview = () => (
    <div className="step-content">
      <h3>Summary & Review</h3>
      <p>Review your strategy before running the backtest</p>
      
      <div className="strategy-summary">
        <div className="summary-section">
          <h4>Basic Information</h4>
          <div className="summary-item">
            <strong>Name:</strong> {strategyData.name}
          </div>
          <div className="summary-item">
            <strong>Description:</strong> {strategyData.description}
          </div>
          <div className="summary-item">
            <strong>Symbol:</strong> {strategyData.symbol}
          </div>
          <div className="summary-item">
            <strong>Timeframe:</strong> {strategyData.timeframe}
          </div>
        </div>

        <div className="summary-section">
          <h4>Trading Parameters</h4>
          <div className="summary-item">
            <strong>Initial Capital:</strong> ${strategyData.initialCapital.toLocaleString()}
          </div>
          <div className="summary-item">
            <strong>Start Date:</strong> {strategyData.startDate}
          </div>
          <div className="summary-item">
            <strong>End Date:</strong> {strategyData.endDate}
          </div>
          <div className="summary-item">
            <strong>Benchmark:</strong> {strategyData.benchmark}
          </div>
        </div>

        <div className="summary-section">
          <h4>Strategy Definition</h4>
          <div className="summary-item">
            <strong>Method:</strong> {strategyMethod === 'natural-language' ? 'Natural Language' : 'Rule Builder'}
          </div>
          {strategyMethod === 'natural-language' && (
            <div className="summary-item">
              <strong>Description:</strong> {naturalLanguageData.description}
            </div>
          )}
        </div>
      </div>

      <div className="action-buttons">
        <button 
          className="btn btn-primary run-backtest-btn"
          onClick={runBacktest}
          disabled={!strategyId || isProcessing}
        >
          {isProcessing ? (
            <>
              <FaSpinner className="spinner" />
              Running Backtest...
            </>
          ) : (
            <>
              <FaPlay />
              Run Backtest
            </>
          )}
        </button>

        <button 
          className="btn btn-secondary"
          onClick={saveStrategy}
        >
          <FaSave />
          Save Strategy
        </button>
      </div>

      {backtestResults && (
        <div className="backtest-results">
          <h4>Backtest Results</h4>
          <div className="results-grid">
            <div className="result-item">
              <strong>Total Return:</strong> {backtestResults.total_return || 'N/A'}%
            </div>
            <div className="result-item">
              <strong>Sharpe Ratio:</strong> {backtestResults.sharpe_ratio || 'N/A'}
            </div>
            <div className="result-item">
              <strong>Max Drawdown:</strong> {backtestResults.max_drawdown || 'N/A'}%
            </div>
            <div className="result-item">
              <strong>Win Rate:</strong> {backtestResults.win_rate || 'N/A'}%
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="strategy-creator">
      <div className="strategy-creator-header">
        <h2>🚀 Create QuantConnect Strategy</h2>
        <p>Build your algorithmic trading strategy using natural language and QuantConnect</p>
      </div>

      <div className="step-indicator">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          return (
            <div key={step.id} className={`step ${currentStep >= step.id ? 'active' : ''} ${currentStep === step.id ? 'current' : ''}`}>
              <div className="step-icon">
                <IconComponent />
              </div>
              <div className="step-info">
                <span className="step-number">{step.id}</span>
                <span className="step-title">{step.name}</span>
                <span className="step-description">{step.description}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="strategy-form">
        {renderStepContent()}
      </div>

      <div className="strategy-form-actions">
        <button 
          className="btn btn-secondary"
          onClick={onBack}
        >
          <FaArrowLeft /> Back to Strategies
        </button>
        
        <div className="step-navigation">
          {currentStep > 1 && (
            <button
              onClick={handlePrevious}
              className="btn btn-secondary"
            >
              <FaChevronLeft /> Previous
            </button>
          )}
          
          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              className="btn btn-primary"
              disabled={!canProceedToNext()}
            >
              Next <FaChevronRight />
            </button>
          ) : (
            <button
              onClick={handleRunBacktest}
              className="btn btn-primary"
              disabled={!canProceedToNext()}
            >
              <FaRocket /> Run Backtest
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuantConnectStrategyCreator;