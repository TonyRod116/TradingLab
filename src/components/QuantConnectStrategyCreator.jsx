import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaChevronRight, FaChevronLeft, FaCog, FaShieldAlt, FaShoppingCart, FaMoneyBillWave, FaSpinner, FaRocket, FaLightbulb, FaCheckCircle, FaExclamationTriangle, FaCode, FaLanguage, FaEye, FaPlay, FaCogs } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { strategyAPI, backtestAPI, quantConnectAPI } from '../config/api';
import RuleBuilder from './RuleBuilder';
import './StrategyCreator.css';
import './RuleBuilder.css';
import './QuantConnectBacktestProgress.css';

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
    start_date: '2025-05-01',
    end_date: '2025-05-16',
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

  // Estado para el loading bar del backtest
  const [isBacktestRunning, setIsBacktestRunning] = useState(false);
  const [backtestProgress, setBacktestProgress] = useState(null);
  const [backtestError, setBacktestError] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);

  // Estado de procesamiento
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [strategyId, setStrategyId] = useState(null);
  const [backtestId, setBacktestId] = useState(null);
  const [backtestResults, setBacktestResults] = useState(null);

  // Estado para natural language
  const [naturalLanguageData, setNaturalLanguageData] = useState({
    description: ''
  });

  // Configuración de pasos
  const steps = [
    { id: 1, name: 'Basic Information', icon: FaCog, description: 'Strategy name, description, and timeframe' },
    { id: 2, name: 'Trading Parameters', icon: FaShieldAlt, description: 'Symbol, capital, and backtest period' },
    { id: 3, name: 'Strategy Method', icon: FaCogs, description: 'Choose between Rule Builder or Natural Language' },
    { id: 4, name: 'Strategy Definition', icon: FaLightbulb, description: 'Define your strategy using chosen method' },
    { id: 5, name: 'Strategy Summary', icon: FaEye, description: 'Review strategy and run backtest' }
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

  const handleNaturalLanguageChange = (description) => {
    setNaturalLanguageData({
      description: description
    });
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
        if (strategyDefinition === 'natural-language') {
          return naturalLanguageData.description.trim() && generatedCode;
        } else {
          return strategyDefinition !== null && quantConnectStrategy.lean_code;
        }
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
        console.log('🤖 Processing Natural Language Strategy:');
        console.log('📝 Text:', naturalLanguageData.description);
        
        // Usar el endpoint de QuantConnect para parsear lenguaje natural
        const backtestParams = {
          symbol: quantConnectStrategy.symbol,
          initial_capital: quantConnectStrategy.initial_capital,
          start_date: quantConnectStrategy.start_date,
          end_date: quantConnectStrategy.end_date,
          benchmark: quantConnectStrategy.benchmark
        };
        
        result = await quantConnectAPI.parseStrategy(
          naturalLanguageData.description,
          backtestParams
        );
        
        console.log('📊 API Response:', result);
        
        if (result.success) {
          // Actualizar la estrategia con el código generado
          setQuantConnectStrategy(prev => ({
            ...prev,
            lean_code: result.python_code,
            strategy_description: naturalLanguageData.description
          }));
          
          setGeneratedCode(result.python_code);
          setStrategyId(result.project_id);
          toast.success('Strategy processed successfully with AI!');
        } else {
          throw new Error(result.error || 'Failed to process strategy');
        }
      } else {
        // Usar Rule Builder (implementar lógica de conversión)
        result = await convertRuleBuilderToStrategy();
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

  // Función para iniciar polling del progreso (basada en test_qc_debug.py)
  const startProgressPolling = (projectId, backtestId) => {
    console.log('🔄 Starting progress polling...');
    console.log('📊 Using strategyId:', strategyId, 'projectId:', projectId, 'backtestId:', backtestId);
    
    const interval = setInterval(async () => {
      try {
        console.log('📊 Checking progress...');
        
        // Usar siempre el endpoint directo de QuantConnect con projectId y backtestId
        let progressData;
        progressData = await quantConnectAPI.checkProgress(projectId, backtestId);
        
        console.log('📊 Progress data received:', progressData);
        
        if (progressData) {
          // Extraer datos del response de QuantConnect
          const backtestData = progressData.backtest || progressData;
          const status = backtestData.status || progressData.status || 'Unknown';
          const progress = backtestData.progress || progressData.progress || 0;
          const completed = backtestData.completed || progressData.completed || false;
          
          console.log('📊 Extracted data - Status:', status, 'Progress:', progress, 'Completed:', completed);
          
          // Actualizar progreso con datos reales del backend
          setBacktestProgress(prev => ({
            ...prev,
            status: status,
            progress: Math.max(prev?.progress || 0, progress),
            state: status,
            status_text: status === 'Completed' ? 'Backtest completed successfully!' : 
                        status === 'In Queue...' ? 'En cola... Esperando procesamiento' :
                        status === 'Running' ? `Ejecutando backtest... ${progress}% completado` :
                        `Estado: ${status} - ${progress}% completado`
          }));
          
          // Si está completado, parar polling
          if (status === 'Completed' || status === 'Completed.' || completed === true) {
            console.log('✅ Backtest completed!');
            clearInterval(interval);
            setPollingInterval(null);
            setIsBacktestRunning(false);
            
            // Actualizar el progreso final
            setBacktestProgress(prev => ({
              ...prev,
              status: 'Completed',
              progress: 100,
              status_text: 'Backtest completed successfully!',
              completed: true
            }));
            
            // Mostrar resultados en la misma página
            setBacktestResults(backtestData);
            
            // Navegar a la página de resultados después de un breve delay
            setTimeout(() => {
              navigate('/quantconnect-backtest', {
                state: {
                  backtestData: backtestData,
                  strategy: quantConnectStrategy
                }
              });
            }, 2000);
          }
        } else {
          console.log('❌ Progress check failed: No data received');
          setBacktestError('Error al consultar progreso: No data received');
          clearInterval(interval);
          setPollingInterval(null);
          setIsBacktestRunning(false);
        }
      } catch (err) {
        console.error('Error checking progress:', err);
        setBacktestError('Error al consultar progreso: ' + err.message);
        clearInterval(interval);
        setPollingInterval(null);
        setIsBacktestRunning(false);
      }
    }, 2000); // Consultar cada 2 segundos

    setPollingInterval(interval);
    
    // Limpiar interval después de 10 minutos (timeout)
    setTimeout(() => {
      clearInterval(interval);
      if (isBacktestRunning) {
        setBacktestError('Backtest timeout - tardó más de 10 minutos');
        setIsBacktestRunning(false);
        setPollingInterval(null);
      }
    }, 600000);
  };

  const runBacktest = async () => {
    setIsBacktestRunning(true);
    setBacktestError(null);
    setBacktestProgress(null);
    
    // Mostrar loading bar inmediatamente con estado inicial
    setBacktestProgress({
      progress: 0,
      state: 'In Queue...',
      status_text: 'Starting backtest...',
      completed: false,
      estimated_seconds_remaining: 300 // 5 minutos estimados
    });
    
    try {
      // Verificar que tenemos código generado
      if (!quantConnectStrategy.lean_code && !generatedCode) {
        throw new Error('No strategy code generated. Please process the strategy first by clicking "Process with AI" in step 4.');
      }

      // Usar el código generado si no está en quantConnectStrategy
      const codeToUse = quantConnectStrategy.lean_code || generatedCode;

      setBacktestProgress(prev => ({
        ...prev,
        status_text: 'Sending to QuantConnect...',
        progress: 20
      }));

      // Usar el endpoint que ya funciona (basado en test_qc_debug.py)
      const strategyData = {
        strategy: {
          id: strategyId || 1,
          name: quantConnectStrategy.name,
          lean_code: codeToUse
        },
        backtest_params: {
          start_date: quantConnectStrategy.start_date,
          end_date: quantConnectStrategy.end_date,
          initial_capital: quantConnectStrategy.initial_capital
        }
      };

      const result = await backtestAPI.runQuantConnectBacktest(strategyData, {
        start_date: quantConnectStrategy.start_date,
        end_date: quantConnectStrategy.end_date,
        initial_capital: quantConnectStrategy.initial_capital
      });

      console.log('🔍 Complete Flow API Response:', result);

      if (result.success) {
        // Extraer IDs del response (basado en test_qc_debug.py)
        const qcData = result.quantconnect || {};
        const projectId = qcData.project_id;
        const backtestId = qcData.backtest_id;
        
        console.log('🚀 Starting progress polling with projectId:', projectId, 'backtestId:', backtestId);
        console.log('📊 QuantConnect data:', qcData);
        
        setBacktestProgress(prev => ({
          ...prev,
          status_text: 'Backtest started, checking progress...',
          progress: 30
        }));
        
        startProgressPolling(projectId, backtestId);
      } else {
        console.log('❌ Backtest failed:', result.error);
        setBacktestError('Error en el backtest: ' + (result.error || 'Error desconocido'));
        setIsBacktestRunning(false);
      }
    } catch (error) {
      console.error('Error running backtest:', error);
      setBacktestError('Error ejecutando backtest: ' + error.message);
      setIsBacktestRunning(false);
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
        return renderStrategySummary();
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

  const renderStrategySummary = () => (
    <div className="step-content">
      <h3>Strategy Summary</h3>
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
      </div>

      {/* Loading Bar para Backtest */}
      {isBacktestRunning && backtestProgress && (
        <div className="progress-container">
          <div className="progress-info">
            <span className="status-text">{backtestProgress.status_text}</span>
            {backtestProgress.estimated_seconds_remaining > 0 && (
              <span className="time-remaining">
                ({Math.ceil(backtestProgress.estimated_seconds_remaining / 60)} min restantes)
              </span>
            )}
            <button 
              onClick={() => {
                console.log('🔄 Manual refresh triggered');
                // Forzar una verificación inmediata
                if (strategyId) {
                  strategyAPI.getQuantConnectStatus(strategyId).then(data => {
                    console.log('🔄 Manual refresh data:', data);
                    if (data && (data.status === 'Completed' || data.status === 'Completed.')) {
                      setBacktestResults(data);
                      setIsBacktestRunning(false);
                    }
                  });
                }
              }}
              style={{
                marginLeft: '10px',
                padding: '5px 10px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh
            </button>
          </div>
          
          <div className="progress-bar-container">
            <div 
              className="progress-bar"
              style={{ width: `${backtestProgress.progress}%` }}
            ></div>
          </div>
          
          <div className="progress-details">
            <span>Progreso: {backtestProgress.progress}%</span>
            <span>Estado: {backtestProgress.state}</span>
            <span>ID: {backtestProgress.backtest_id}</span>
          </div>
        </div>
      )}

      {/* Error del Backtest */}
      {backtestError && (
        <div className="error-message">
          ❌ {backtestError}
        </div>
      )}
      
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
        <div className="natural-language-section" style={{
          backgroundColor: '#2a2a2a',
          padding: '20px',
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ 
              color: '#ffffff', 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: '600'
            }}>
              Strategy Description
            </label>
            <textarea
              value={naturalLanguageData.description}
              onChange={(e) => handleNaturalLanguageChange(e.target.value)}
              placeholder="Describe your strategy in natural language (language will be detected automatically). For example: 'Buy SPY when RSI is below 30 and price is above 20-day SMA, sell when RSI is above 70'"
              rows={6}
              required
              style={{
                width: '100%',
                backgroundColor: '#444444',
                color: '#ffffff',
                border: '1px solid #666666',
                borderRadius: '4px',
                padding: '10px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>


          <button 
            className="btn btn-primary process-btn"
            onClick={processStrategy}
            disabled={!naturalLanguageData.description || isProcessing}
            style={{
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
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
          <h4>✅ Generated Code</h4>
          <p style={{ color: '#28a745', marginBottom: '10px' }}>
            Strategy processed successfully! You can now proceed to run the backtest.
          </p>
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
          <div className="summary-item">
            <strong>Status:</strong> 
            {generatedCode || quantConnectStrategy.lean_code ? (
              <span style={{ color: '#28a745' }}> ✅ Processed and ready for backtest</span>
            ) : (
              <span style={{ color: '#dc3545' }}> ❌ Not processed - Please go back to step 4</span>
            )}
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button 
          className="btn btn-primary run-backtest-btn"
          onClick={runBacktest}
          disabled={!generatedCode && !quantConnectStrategy.lean_code || isProcessing}
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
        <div className="backtest-results" style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '20px',
          margin: '20px 0'
        }}>
          <h4 style={{ color: '#28a745', marginBottom: '15px' }}>✅ Backtest Results</h4>
          <div className="results-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }}>
            <div className="result-item" style={{
              backgroundColor: '#ffffff',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <strong>Total Return:</strong> {backtestResults.statistics?.['Net Profit'] || backtestResults.total_return || '0%'}
            </div>
            <div className="result-item" style={{
              backgroundColor: '#ffffff',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <strong>Sharpe Ratio:</strong> {backtestResults.statistics?.['Sharpe Ratio'] || backtestResults.sharpe_ratio || '0'}
            </div>
            <div className="result-item" style={{
              backgroundColor: '#ffffff',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <strong>Max Drawdown:</strong> {backtestResults.statistics?.['Drawdown'] || backtestResults.max_drawdown || '0%'}
            </div>
            <div className="result-item" style={{
              backgroundColor: '#ffffff',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <strong>Win Rate:</strong> {backtestResults.statistics?.['Win Rate'] || backtestResults.win_rate || '0%'}
            </div>
            <div className="result-item" style={{
              backgroundColor: '#ffffff',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <strong>Total Orders:</strong> {backtestResults.statistics?.['Total Orders'] || '0'}
            </div>
            <div className="result-item" style={{
              backgroundColor: '#ffffff',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <strong>Final Equity:</strong> {backtestResults.runtimeStatistics?.Equity || '$100,000.00'}
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