import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaChevronRight, FaChevronLeft, FaCog, FaShieldAlt, FaShoppingCart, FaMoneyBillWave, FaSpinner, FaRocket, FaLightbulb, FaCheckCircle, FaExclamationTriangle, FaCode, FaLanguage, FaEye, FaPlay, FaCogs } from 'react-icons/fa';
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
  
  // Estado de la estrategia en formato QuantConnect
  const [quantConnectStrategy, setQuantConnectStrategy] = useState({
    // Información básica
    name: '',
    description: '',
    
    // Parámetros de trading
    symbol: 'SPY',
    timeframe: '1d',
    initial_capital: 100000,
    start_date: '2021-01-01',
    end_date: '2024-01-01',
    benchmark: 'SPY',
    
    // Método de estrategia
    strategy_method: null, // 'rule_builder' o 'natural_language'
    
    // Reglas del RuleBuilder
    rules: {
      direction: 'long', // 'long' o 'short'
      entry_rules: [],
      exit_rules: []
    },
    
    // Descripción en lenguaje natural
    strategy_description: '',
    
    // Código generado
    lean_code: '',
    
    // Metadatos
    created_at: new Date().toISOString(),
    user_id: user?.id || null
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
    { id: 3, name: 'Strategy Method', icon: FaCogs, description: 'Choose between Rule Builder or Natural Language' },
    { id: 4, name: 'Strategy Definition', icon: FaLightbulb, description: 'Define your strategy using chosen method' },
    { id: 5, name: 'Backtest Results', icon: FaMoneyBillWave, description: 'Review results and save strategy' }
  ];

  // Inicializar con template si existe
  useEffect(() => {
    if (template) {
      setQuantConnectStrategy(prev => ({
        ...prev,
        name: template.name || '',
        description: template.description || '',
        symbol: template.symbol || 'SPY'
      }));
    }
  }, [template]);

  const handleInputChange = (field, value) => {
    setQuantConnectStrategy(prev => ({
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
        return quantConnectStrategy.name.trim() && quantConnectStrategy.description.trim();
      case 2: // Trading Parameters
        return quantConnectStrategy.symbol && quantConnectStrategy.initial_capital > 0;
      case 3: // Strategy Method Selection
        return quantConnectStrategy.strategy_method !== null;
      case 4: // Strategy Definition
        return strategyDefinition !== null;
      case 5: // Backtest Results
        return true;
      default:
        return false;
    }
  };

  const handleRunBacktest = async () => {
    // Usar la función runBacktest que sí envía datos al backend
    await runBacktest();
  };

  const handleStrategyMethodSelect = (method) => {
    setStrategyMethod(method);
    setStrategyDefinition(method); // Por defecto, usar el mismo método para la definición
    
    // Guardar en formato QuantConnect
    setQuantConnectStrategy(prev => ({
      ...prev,
      strategy_method: method === 'rule-builder' ? 'rule_builder' : 'natural_language'
    }));
  };

  const handleStrategyDefinitionSelect = (method) => {
    setStrategyDefinition(method);
  };

  const handleNaturalLanguageChange = (description) => {
    setQuantConnectStrategy(prev => ({
      ...prev,
      strategy_description: description
    }));
  };

  // Función para convertir reglas del RuleBuilder al formato QuantConnect
  const convertRulesToQuantConnect = (rules) => {
    
    const convertCondition = (condition) => {
      // Mapear operadores a formato QuantConnect
      const operatorMap = {
        'greater_than': '>',
        'less_than': '<',
        'greater_equal': '>=',
        'less_equal': '<=',
        'equal': '==',
        'not_equal': '!='
      };

      // Mapear valores a indicadores de QuantConnect
      const valueMap = {
        'close': 'Close',
        'open': 'Open',
        'high': 'High',
        'low': 'Low',
        'volume': 'Volume',
        'sma_10': 'sma10',
        'sma_20': 'sma20',
        'sma_50': 'sma50',
        'sma_200': 'sma200',
        'ema_12': 'ema12',
        'ema_26': 'ema26',
        'rsi_14': 'rsi',
        'rsi_20': 'rsi20',
        'rsi_30': 'rsi30',
        'rsi_50': 'rsi50',
        'rsi_70': 'rsi70',
        'rsi_80': 'rsi80',
        'bb_upper': 'bb.UpperBand',
        'bb_middle': 'bb.MiddleBand',
        'bb_lower': 'bb.LowerBand',
        'macd': 'macd',
        'macd_signal': 'macd.Signal',
        'macd_histogram': 'macd.Histogram',
        'stoch_k': 'stoch.K',
        'stoch_d': 'stoch.D',
        'williams_r': 'willr',
        'cci': 'cci',
        'adx': 'adx',
        'atr': 'atr',
        'obv': 'obv',
        'vwap': 'vwap'
      };

      return {
        first_value: valueMap[condition.firstValue] || condition.firstValue,
        operator: operatorMap[condition.operator] || condition.operator,
        second_value: valueMap[condition.secondValue] || condition.secondValue,
        value: condition.value || 0,
        exit_type: condition.exitType || null
      };
    };

    const convertRule = (rule) => {
      // Si la regla ya tiene el formato correcto, devolverla tal como está
      if (rule.conditions && Array.isArray(rule.conditions)) {
        return {
          id: rule.id || Date.now(),
          conditions: rule.conditions.map(convertCondition),
          logical_operators: rule.logicalOperators || [],
          logic: rule.logicOperator || 'AND'
        };
      }
      
      // Si es una regla simple del RuleBuilder, convertirla
      return {
        id: rule.id || Date.now(),
        conditions: [convertCondition(rule)],
        logical_operators: [],
        logic: 'AND'
      };
    };

    const result = {
      direction: rules.direction || 'long',
      entry_rules: (rules.entryRules || []).map(convertRule),
      exit_rules: (rules.exitRules || []).map(convertRule)
    };
    
    return result;
  };

  // Función para generar código Lean a partir de las reglas
  const generateLeanCode = (rules) => {
    // Obtener indicadores únicos usados en las reglas
    const getUsedIndicators = (rules) => {
      const indicators = new Set();
      
      const checkCondition = (condition) => {
        if (condition.first_value && condition.first_value.includes('sma')) {
          indicators.add(`sma${condition.first_value.match(/\d+/)?.[0] || '20'}`);
        }
        if (condition.second_value && condition.second_value.includes('sma')) {
          indicators.add(`sma${condition.second_value.match(/\d+/)?.[0] || '20'}`);
        }
        if (condition.first_value && condition.first_value.includes('rsi')) {
          indicators.add('rsi');
        }
        if (condition.second_value && condition.second_value.includes('rsi')) {
          indicators.add('rsi');
        }
        if (condition.first_value && condition.first_value.includes('bb')) {
          indicators.add('bb');
        }
        if (condition.second_value && condition.second_value.includes('bb')) {
          indicators.add('bb');
        }
        if (condition.first_value && condition.first_value.includes('atr')) {
          indicators.add('atr');
        }
        if (condition.second_value && condition.second_value.includes('atr')) {
          indicators.add('atr');
        }
      };
      
      [...(rules.entry_rules || []), ...(rules.exit_rules || [])].forEach(rule => {
        if (rule.conditions) {
          rule.conditions.forEach(checkCondition);
        }
      });
      
      return Array.from(indicators);
    };
    
    const usedIndicators = getUsedIndicators(rules);
    
    let leanCode = `// Generated QuantConnect Strategy
using QuantConnect.Indicators;
using QuantConnect.Data.Market;

public class GeneratedStrategy : QCAlgorithm
{
    ${usedIndicators.includes('sma10') ? 'private SimpleMovingAverage sma10;' : ''}
    ${usedIndicators.includes('sma20') ? 'private SimpleMovingAverage sma20;' : ''}
    ${usedIndicators.includes('sma50') ? 'private SimpleMovingAverage sma50;' : ''}
    ${usedIndicators.includes('sma200') ? 'private SimpleMovingAverage sma200;' : ''}
    ${usedIndicators.includes('rsi') ? 'private RelativeStrengthIndex rsi;' : ''}
    ${usedIndicators.includes('bb') ? 'private BollingerBands bb;' : ''}
    ${usedIndicators.includes('atr') ? 'private AverageTrueRange atr;' : ''}
    
    public override void Initialize()
    {
        SetStartDate(${quantConnectStrategy.start_date.replace(/-/g, ', ')});
        SetEndDate(${quantConnectStrategy.end_date.replace(/-/g, ', ')});
        SetCash(${quantConnectStrategy.initial_capital});
        
        var symbol = AddEquity("${quantConnectStrategy.symbol}").Symbol;
        
        // Initialize indicators
        ${usedIndicators.includes('sma10') ? 'sma10 = SMA(symbol, 10);' : ''}
        ${usedIndicators.includes('sma20') ? 'sma20 = SMA(symbol, 20);' : ''}
        ${usedIndicators.includes('sma50') ? 'sma50 = SMA(symbol, 50);' : ''}
        ${usedIndicators.includes('sma200') ? 'sma200 = SMA(symbol, 200);' : ''}
        ${usedIndicators.includes('rsi') ? 'rsi = RSI(symbol, 14);' : ''}
        ${usedIndicators.includes('bb') ? 'bb = BB(symbol, 20, 2);' : ''}
        ${usedIndicators.includes('atr') ? 'atr = ATR(symbol, 14);' : ''}
    }
    
    public override void OnData(Slice data)
    {
        if (!IsWarmingUp)
        {
            // Entry Rules
            if (ShouldEnter())
            {
                SetHoldings("${quantConnectStrategy.symbol}", ${rules.direction === 'long' ? '1.0' : '-1.0'});
            }
            
            // Exit Rules  
            if (ShouldExit())
            {
                Liquidate("${quantConnectStrategy.symbol}");
            }
        }
    }
    
    private bool ShouldEnter()
    {
        // Generated entry logic based on rules
        ${generateEntryLogic(rules.entry_rules)}
    }
    
    private bool ShouldExit()
    {
        // Generated exit logic based on rules
        ${generateExitLogic(rules.exit_rules)}
    }
}`;

    return leanCode;
  };

  const generateEntryLogic = (entryRules) => {
    if (!entryRules || entryRules.length === 0) {
      return 'return false;';
    }

    const allConditions = entryRules.map(rule => {
      if (!rule.conditions || rule.conditions.length === 0) {
        return 'false';
      }
      
      const conditions = rule.conditions.map(condition => {
        if (condition.first_value && condition.operator && condition.second_value) {
          return `${condition.first_value} ${condition.operator} ${condition.second_value}`;
        }
        return 'false';
      }).join(` ${rule.logic || 'AND'} `);
      
      return conditions;
    });
    
    return `return ${allConditions.join(' || ')};`;
  };

  const generateExitLogic = (exitRules) => {
    if (!exitRules || exitRules.length === 0) {
      return 'return false;';
    }

    const allConditions = exitRules.map(rule => {
      if (!rule.conditions || rule.conditions.length === 0) {
        return 'false';
      }
      
      const conditions = rule.conditions.map(condition => {
        if (condition.exit_type) {
          // Manejar tipos de salida específicos
          switch (condition.exit_type) {
            case 'percentage':
              return `Portfolio["${quantConnectStrategy.symbol}"].UnrealizedProfitPercent ${condition.operator} ${condition.value || 5}`;
            case 'atr_based':
              return `ATR(14) ${condition.operator} ${condition.value || 2}`;
            case 'stop_loss':
              return `Portfolio["${quantConnectStrategy.symbol}"].UnrealizedProfitPercent < -3`;
            case 'take_profit':
              return `Portfolio["${quantConnectStrategy.symbol}"].UnrealizedProfitPercent > 5`;
            default:
              return `// Exit condition: ${condition.exit_type}`;
          }
        }
        
        if (condition.first_value && condition.operator && condition.second_value) {
          return `${condition.first_value} ${condition.operator} ${condition.second_value}`;
        }
        
        return 'false';
      }).join(` ${rule.logic || 'AND'} `);
      
      return conditions;
    });
    
    return `return ${allConditions.join(' || ')};`;
  };

  const handleRuleChange = (rules) => {
    // Convertir formato del RuleBuilder al formato QuantConnect
    const quantConnectRules = convertRulesToQuantConnect(rules);
    
    // Generar código Lean
    const leanCode = generateLeanCode(quantConnectRules);
    
    setQuantConnectStrategy(prev => ({
      ...prev,
      rules: quantConnectRules,
      lean_code: leanCode
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
    setIsProcessing(true);
    try {
      // Primero crear la estrategia si no existe
      let currentStrategyId = strategyId;
      
      if (!currentStrategyId) {
              const strategyResult = await saveStrategy();
        if (strategyResult && strategyResult.id) {
          currentStrategyId = strategyResult.id;
          setStrategyId(currentStrategyId);
        } else {
          throw new Error('Failed to create strategy');
        }
      }

      // Preparar datos para el nuevo endpoint de QuantConnect
      const strategyData = {
        id: currentStrategyId,
        name: quantConnectStrategy.name,
        rules: quantConnectStrategy.rules,
        symbols: [quantConnectStrategy.symbol],
        timeframe: quantConnectStrategy.timeframe,
        lean_code: quantConnectStrategy.lean_code
      };

      const backtestParams = {
        start_date: quantConnectStrategy.start_date,
        end_date: quantConnectStrategy.end_date,
        initial_capital: quantConnectStrategy.initial_capital
      };

      const result = await backtestAPI.runQuantConnectBacktest(strategyData, backtestParams);

      if (result.success) {
        setBacktestId(result.quantconnect?.backtest_id || result.backtest_id);
        setBacktestResults(result.backtest_results);
        toast.success('QuantConnect backtest completed successfully!');
      } else {
        throw new Error(result.message || 'QuantConnect backtest failed');
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
      console.log('Saving strategy with QuantConnect format:', quantConnectStrategy);

      // Enviar al backend (ya está en formato QuantConnect)
      const response = await strategyAPI.createStrategy(quantConnectStrategy);
      
      if (response && response.id) {
        setStrategyId(response.id);
        toast.success('Strategy saved successfully!');
        if (onStrategyCreated) {
          onStrategyCreated();
        }
        return response;
      } else {
        throw new Error('No strategy ID returned from backend');
      }
    } catch (error) {
      console.error('Error saving strategy:', error);
      toast.error('Error saving strategy');
      throw error;
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
        return renderBacktestResults();
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
          value={quantConnectStrategy.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter strategy name"
          required
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={quantConnectStrategy.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe your strategy"
          rows={4}
          required
        />
      </div>

      <div className="form-group">
        <label>Timeframe</label>
        <select
          value={quantConnectStrategy.timeframe}
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
          value={quantConnectStrategy.symbol}
          onChange={(e) => handleInputChange('symbol', e.target.value)}
          placeholder="e.g., SPY, AAPL, BTCUSD"
          required
        />
      </div>

      <div className="form-group">
        <label>Initial Capital</label>
        <input
          type="number"
          value={quantConnectStrategy.initial_capital}
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
            value={quantConnectStrategy.start_date}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            value={quantConnectStrategy.end_date}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Benchmark</label>
        <input
          type="text"
          value={quantConnectStrategy.benchmark}
          onChange={(e) => handleInputChange('benchmark', e.target.value)}
          placeholder="e.g., SPY"
          required
        />
      </div>
    </div>
  );

  const renderStrategyDescription = () => (
    <div className="step-content">
      <h3>Strategy Description</h3>
      <p>Describe your trading strategy in natural language</p>
      
      <div className="form-group">
        <label htmlFor="strategyDescription">Strategy Description</label>
        <textarea
          id="strategyDescription"
          value={quantConnectStrategy.strategy_description}
          onChange={(e) => handleInputChange('strategyDescription', e.target.value)}
          placeholder="Describe your trading strategy in detail. For example: 'Buy when RSI is below 30 and price is above 20-day moving average. Sell when RSI is above 70 or price drops below 20-day moving average.'"
          rows={6}
          required
        />
      </div>
    </div>
  );

  const renderBacktestResults = () => (
    <div className="step-content">
      <h3>Backtest Results</h3>
      <p>Review your strategy configuration and run backtest</p>
      
      <div className="strategy-summary">
        <h4>Strategy Summary</h4>
        <div className="summary-grid">
          <div className="summary-item">
            <strong>Name:</strong> {quantConnectStrategy.name}
          </div>
          <div className="summary-item">
            <strong>Symbol:</strong> {quantConnectStrategy.symbol}
          </div>
          <div className="summary-item">
            <strong>Capital:</strong> ${quantConnectStrategy.initial_capital.toLocaleString()}
          </div>
          <div className="summary-item">
            <strong>Period:</strong> {quantConnectStrategy.start_date} to {quantConnectStrategy.end_date}
          </div>
        </div>
        
        <div className="strategy-description">
          <h4>Strategy Description</h4>
          <p>{quantConnectStrategy.strategy_description}</p>
        </div>
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
            initialRules={{
              entryRules: quantConnectStrategy.rules.entry_rules || [],
              exitRules: quantConnectStrategy.rules.exit_rules || []
            }}
          />
          
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
            <strong>Name:</strong> {quantConnectStrategy.name}
          </div>
          <div className="summary-item">
            <strong>Description:</strong> {quantConnectStrategy.description}
          </div>
          <div className="summary-item">
            <strong>Symbol:</strong> {quantConnectStrategy.symbol}
          </div>
          <div className="summary-item">
            <strong>Timeframe:</strong> {quantConnectStrategy.timeframe}
          </div>
        </div>

        <div className="summary-section">
          <h4>Trading Parameters</h4>
          <div className="summary-item">
            <strong>Initial Capital:</strong> ${quantConnectStrategy.initial_capital.toLocaleString()}
          </div>
          <div className="summary-item">
            <strong>Start Date:</strong> {quantConnectStrategy.start_date}
          </div>
          <div className="summary-item">
            <strong>End Date:</strong> {quantConnectStrategy.end_date}
          </div>
          <div className="summary-item">
            <strong>Benchmark:</strong> {quantConnectStrategy.benchmark}
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