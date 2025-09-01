import React, { useState, useCallback } from 'react';
import { 
  FaPlus, 
  FaTimes, 
  FaEye, 
  FaChartLine, 
  FaChartBar, 
  FaChartArea, 
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaGreaterThan,
  FaLessThan,
  FaCrosshairs,
  FaPlay,
  FaPause,
  FaStop,
  FaEdit,
  FaTrash
} from 'react-icons/fa';
import './RuleBuilder.css';

const RuleBuilder = ({ onAddRule, onRemoveRule, onMoveRule, rules }) => {
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    name: '',
    rule_type: 'condition',
    condition_type: 'indicator',
    action_type: 'buy',
    conditions: [
      {
        left_operand: '',
        operator: 'gt',
        right_operand: '',
        logical_operator: 'and'
      }
    ],
    priority: 1,
    parameters: {}
  });

  // Available indicators and their configurations - Based on your Parquet backend
  const indicators = {
    moving_averages: [
      { name: 'sma_20', label: 'SMA 20 (Simple Moving Average 20 períodos)', type: 'trend', description: 'Media móvil simple de 20 períodos' },
      { name: 'sma_50', label: 'SMA 50 (Simple Moving Average 50 períodos)', type: 'trend', description: 'Media móvil simple de 50 períodos' },
      { name: 'ema_20', label: 'EMA 20 (Exponential Moving Average 20 períodos)', type: 'trend', description: 'Media móvil exponencial de 20 períodos' },
      { name: 'ema_50', label: 'EMA 50 (Exponential Moving Average 50 períodos)', type: 'trend', description: 'Media móvil exponencial de 50 períodos' },
      { name: 'vwap', label: 'VWAP (Volume Weighted Average Price)', type: 'trend', description: 'Precio promedio ponderado por volumen' }
    ],
    vwap_bands: [
      { name: 'vwap_plus_2_5', label: 'VWAP + 2.5σ (Banda superior)', type: 'trend', description: 'VWAP + 2.5 desviaciones estándar' },
      { name: 'vwap_plus_2_0', label: 'VWAP + 2.0σ (Banda superior)', type: 'trend', description: 'VWAP + 2.0 desviaciones estándar' },
      { name: 'vwap_plus_1_5', label: 'VWAP + 1.5σ (Banda superior)', type: 'trend', description: 'VWAP + 1.5 desviaciones estándar' },
      { name: 'vwap_plus_1_0', label: 'VWAP + 1.0σ (Banda superior)', type: 'trend', description: 'VWAP + 1.0 desviaciones estándar' },
      { name: 'vwap_plus_0_5', label: 'VWAP + 0.5σ (Banda superior)', type: 'trend', description: 'VWAP + 0.5 desviaciones estándar' },
      { name: 'vwap_minus_0_5', label: 'VWAP - 0.5σ (Banda inferior)', type: 'trend', description: 'VWAP - 0.5 desviaciones estándar' },
      { name: 'vwap_minus_1_0', label: 'VWAP - 1.0σ (Banda inferior)', type: 'trend', description: 'VWAP - 1.0 desviaciones estándar' },
      { name: 'vwap_minus_1_5', label: 'VWAP - 1.5σ (Banda inferior)', type: 'trend', description: 'VWAP - 1.5 desviaciones estándar' },
      { name: 'vwap_minus_2_0', label: 'VWAP - 2.0σ (Banda inferior)', type: 'trend', description: 'VWAP - 2.0 desviaciones estándar' },
      { name: 'vwap_minus_2_5', label: 'VWAP - 2.5σ (Banda inferior)', type: 'trend', description: 'VWAP - 2.5 desviaciones estándar' }
    ],
    momentum: [
      { name: 'rsi', label: 'RSI (Relative Strength Index)', type: 'momentum', description: 'Índice de fuerza relativa' },
      { name: 'macd_line', label: 'MACD Line', type: 'momentum', description: 'Línea principal del MACD' },
      { name: 'macd_signal', label: 'MACD Signal Line', type: 'momentum', description: 'Línea de señal del MACD' },
      { name: 'macd_histogram', label: 'MACD Histogram', type: 'momentum', description: 'Histograma del MACD' },
      { name: 'stoch_k', label: 'Stochastic %K', type: 'momentum', description: 'Estocástico %K' },
      { name: 'stoch_d', label: 'Stochastic %D', type: 'momentum', description: 'Estocástico %D' }
    ],
    volatility: [
      { name: 'atr', label: 'ATR (Average True Range)', type: 'volatility', description: 'Rango verdadero promedio' },
      { name: 'bb_upper', label: 'Bollinger Bands Upper (2σ)', type: 'volatility', description: 'Banda superior de Bollinger (2 desviaciones estándar)' },
      { name: 'bb_middle', label: 'Bollinger Bands Middle (SMA)', type: 'volatility', description: 'Banda media de Bollinger (SMA)' },
      { name: 'bb_lower', label: 'Bollinger Bands Lower (2σ)', type: 'volatility', description: 'Banda inferior de Bollinger (2 desviaciones estándar)' }
    ],
    price_data: [
      { name: 'open', label: 'Open (Precio de apertura)', type: 'price', description: 'Precio de apertura del período' },
      { name: 'high', label: 'High (Precio más alto)', type: 'price', description: 'Precio más alto del período' },
      { name: 'low', label: 'Low (Precio más bajo)', type: 'price', description: 'Precio más bajo del período' },
      { name: 'close', label: 'Close (Precio de cierre)', type: 'price', description: 'Precio de cierre del período' },
      { name: 'volume', label: 'Volume (Volumen)', type: 'volume', description: 'Volumen de trading del período' }
    ]
  };

  const operators = [
    { value: 'gt', label: 'Greater Than >', description: 'Mayor que' },
    { value: 'gte', label: 'Greater Than or Equal >=', description: 'Mayor o igual que' },
    { value: 'lt', label: 'Less Than <', description: 'Menor que' },
    { value: 'lte', label: 'Less Than or Equal <=', description: 'Menor o igual que' },
    { value: 'eq', label: 'Equal ==', description: 'Igual a' },
    { value: 'ne', label: 'Not Equal !=', description: 'Diferente de' },
    { value: 'crosses_above', label: 'Crosses Above', description: 'Cruza por encima' },
    { value: 'crosses_below', label: 'Crosses Below', description: 'Cruza por debajo' },
    { value: 'above', label: 'Above', description: 'Por encima de' },
    { value: 'below', label: 'Below', description: 'Por debajo de' }
  ];

  const actions = [
    { value: 'buy', label: 'Buy', description: 'Comprar' },
    { value: 'sell', label: 'Sell', description: 'Vender' },
    { value: 'close', label: 'Close Position', description: 'Cerrar posición' },
    { value: 'modify', label: 'Modify Position', description: 'Modificar posición' },
    { value: 'wait', label: 'Wait', description: 'Esperar' }
  ];

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setRuleForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const addCondition = useCallback(() => {
    setRuleForm(prev => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        {
          left_operand: '',
          operator: 'gt',
          right_operand: '',
          logical_operator: 'and'
        }
      ]
    }));
  }, []);

  const removeCondition = useCallback((index) => {
    setRuleForm(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  }, []);

  const updateCondition = useCallback((index, field, value) => {
    setRuleForm(prev => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) => 
        i === index ? { ...condition, [field]: value } : condition
      )
    }));
  }, []);

  const handleIndicatorSelect = useCallback((indicator) => {
    setRuleForm(prev => ({
      ...prev,
      left_operand: indicator.name,
      parameters: indicator.parameters || {}
    }));
  }, []);

  const handleAddRule = useCallback(() => {
    if (!ruleForm.name.trim()) {
      alert('Please enter a rule name');
      return;
    }

    if (ruleForm.rule_type === 'condition') {
      const hasValidConditions = ruleForm.conditions.every(condition => 
        condition.left_operand && condition.operator && condition.right_operand
      );
      
      if (!hasValidConditions) {
        alert('Please complete all condition fields');
        return;
      }
    }

    if (ruleForm.rule_type === 'action' && !ruleForm.action_type) {
      alert('Please select an action');
      return;
    }

    const newRule = {
      ...ruleForm,
      priority: rules.length + 1,
      order: rules.length + 1
    };

    onAddRule(newRule);
    setShowRuleForm(false);
    setRuleForm({
      name: '',
      rule_type: 'condition',
      condition_type: 'indicator',
      action_type: 'buy',
      conditions: [
        {
          left_operand: '',
          operator: 'gt',
          right_operand: '',
          logical_operator: 'and'
        }
      ],
      priority: 1,
      parameters: {}
    });
  }, [ruleForm, rules.length, onAddRule]);

  const handleCancel = useCallback(() => {
    setShowRuleForm(false);
    setRuleForm({
      name: '',
      rule_type: 'condition',
      condition_type: 'indicator',
      action_type: 'buy',
      conditions: [
        {
          left_operand: '',
          operator: 'gt',
          right_operand: '',
          logical_operator: 'and'
        }
      ],
      priority: 1,
      parameters: {}
    });
  }, []);

  const renderConditionRuleForm = () => (
    <div className="rule-form-section">
      <div className="form-group">
        <label>Condition Type</label>
        <select
          name="condition_type"
          value={ruleForm.condition_type}
          onChange={handleInputChange}
        >
          <option value="indicator">Technical Indicator</option>
          <option value="price">Price Action</option>
          <option value="volume">Volume</option>
          <option value="time">Time-based</option>
        </select>
      </div>

      <div className="conditions-container">
        <div className="conditions-header">
          <h4>Rule Conditions</h4>
          <button 
            type="button" 
            onClick={addCondition}
            className="btn btn-secondary btn-sm"
          >
            + Add Condition
          </button>
        </div>

        {ruleForm.conditions.map((condition, index) => (
          <div key={index} className="condition-group">
            <div className="condition-header">
              <span className="condition-number">Condition {index + 1}</span>
              {ruleForm.conditions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCondition(index)}
                  className="btn btn-danger btn-sm"
                  title="Remove condition"
                >
                  ×
                </button>
              )}
            </div>

            <div className="condition-fields">
              <div className="form-group">
                <label>Left Indicator/Value</label>
                <select
                  value={condition.left_operand}
                  onChange={(e) => updateCondition(index, 'left_operand', e.target.value)}
                >
                  <option value="">Select indicator</option>
                  {Object.entries(indicators).map(([category, categoryIndicators]) => (
                    <optgroup key={category} label={category.replace('_', ' ').toUpperCase()}>
                      {categoryIndicators.map(indicator => (
                        <option key={indicator.name} value={indicator.name}>
                          {indicator.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Operator</label>
                <select
                  value={condition.operator}
                  onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Right Indicator/Value</label>
                <input
                  type="text"
                  value={condition.right_operand}
                  onChange={(e) => updateCondition(index, 'right_operand', e.target.value)}
                  placeholder="e.g., 30, 50, sma_20, vwap"
                />
              </div>
            </div>

            {index < ruleForm.conditions.length - 1 && (
              <div className="form-group">
                <label>Conectivo Lógico</label>
                <select
                  value={condition.logical_operator}
                  onChange={(e) => updateCondition(index, 'logical_operator', e.target.value)}
                >
                  <option value="and">Y (AND)</option>
                  <option value="or">O (OR)</option>
                </select>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderActionRuleForm = () => (
    <div className="rule-form-section">
      <div className="form-group">
        <label>Action Type</label>
        <select
          name="action_type"
          value={ruleForm.action_type}
          onChange={handleInputChange}
        >
          {actions.map(action => (
            <option key={action.value} value={action.value}>
              {action.label}
            </option>
          ))}
        </select>
      </div>

      {ruleForm.action_type === 'buy' || ruleForm.action_type === 'sell' ? (
        <div className="form-group">
          <label>Position Size</label>
          <input
            type="number"
            name="position_size"
            value={ruleForm.parameters.position_size || ''}
            onChange={(e) => setRuleForm(prev => ({
              ...prev,
              parameters: { ...prev.parameters, position_size: e.target.value }
            }))}
            placeholder="1.00"
            step="0.01"
            min="0.01"
          />
        </div>
      ) : null}

      {ruleForm.action_type === 'modify' && (
        <div className="form-group">
          <label>Modification Type</label>
          <select
            name="modification_type"
            value={ruleForm.parameters.modification_type || ''}
            onChange={(e) => setRuleForm(prev => ({
              ...prev,
              parameters: { ...prev.parameters, modification_type: e.target.value }
            }))}
          >
            <option value="">Select modification</option>
            <option value="stop_loss">Stop Loss</option>
            <option value="take_profit">Take Profit</option>
            <option value="trailing_stop">Trailing Stop</option>
          </select>
        </div>
      )}
    </div>
  );

  const renderRuleForm = () => (
    <div className="rule-form-overlay">
      <div className="rule-form-modal">
        <div className="rule-form-header">
          <h3>Add New Rule</h3>
          <button onClick={handleCancel} className="close-button">
            <FaTimes />
          </button>
        </div>

        <div className="rule-form-body">
          <div className="form-group">
            <label>Rule Name *</label>
            <input
              type="text"
              name="name"
              value={ruleForm.name}
              onChange={handleInputChange}
              placeholder="e.g., RSI Oversold, Buy Signal"
              required
            />
          </div>

          <div className="form-group">
            <label>Rule Type *</label>
            <select
              name="rule_type"
              value={ruleForm.rule_type}
              onChange={handleInputChange}
            >
              <option value="condition">Condition</option>
              <option value="action">Action</option>
              <option value="filter">Filter</option>
            </select>
          </div>

          {ruleForm.rule_type === 'condition' && renderConditionRuleForm()}
          {ruleForm.rule_type === 'action' && renderActionRuleForm()}

          <div className="rule-form-actions">
            <button onClick={handleCancel} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleAddRule} className="btn btn-primary">
              Add Rule
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="rule-builder">
      <div className="rule-builder-header">
        <h4>Rule Builder</h4>
        <button
          onClick={() => setShowRuleForm(true)}
          className="btn btn-primary btn-sm"
        >
          <FaPlus /> Add Rule
        </button>
      </div>

      <div className="rule-builder-info">
        <p><FaChartLine className="info-icon" /> <strong>Rule Builder powered by your Parquet backend!</strong></p>
        <p>Build your strategy using pre-calculated technical indicators:</p>
        <ul>
          <li><strong><FaChartBar className="list-icon" /> Moving Averages:</strong> SMA 20/50, EMA 20/50, VWAP</li>
          <li><strong><FaChartArea className="list-icon" /> VWAP Bands:</strong> 10 bandas de desviación estándar (±0.5σ a ±2.5σ)</li>
          <li><strong><FaChartPie className="list-icon" /> Momentum:</strong> RSI, MACD, Stochastic</li>
          <li><strong><FaCrosshairs className="list-icon" /> Volatility:</strong> ATR, Bollinger Bands</li>
          <li><strong><FaPlay className="list-icon" /> Price Data:</strong> Open, High, Low, Close, Volume</li>
          <li><strong><FaEdit className="list-icon" /> Conditions:</strong> Define when to enter/exit trades</li>
          <li><strong><FaArrowUp className="list-icon" /> Actions:</strong> Specify what to do when conditions are met</li>
        </ul>
        <p><em>All indicators are pre-calculated and optimized for fast backtesting! 🚀</em></p>
      </div>

      {showRuleForm && renderRuleForm()}
    </div>
  );
};

export default RuleBuilder;
