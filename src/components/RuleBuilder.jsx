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
  FaTrash,
  FaSignInAlt,
  FaSignOutAlt,
  FaShieldAlt,
  FaShoppingCart,
  FaMoneyBillWave
} from 'react-icons/fa';
import './RuleBuilder.css';

const RuleBuilder = ({ onAddRule, onRemoveRule, onMoveRule, rules, activeSection, readOnly = false }) => {
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
      { name: 'sma_20', label: 'SMA 20 (Media móvil simple)', type: 'indicator', description: 'Media móvil simple de 20 períodos' },
      { name: 'sma_50', label: 'SMA 50 (Media móvil simple)', type: 'indicator', description: 'Media móvil simple de 50 períodos' },
      { name: 'ema_20', label: 'EMA 20 (Media móvil exponencial)', type: 'indicator', description: 'Media móvil exponencial de 20 períodos' },
      { name: 'ema_50', label: 'EMA 50 (Media móvil exponencial)', type: 'indicator', description: 'Media móvil exponencial de 50 períodos' },
      { name: 'vwap', label: 'VWAP (Precio promedio ponderado por volumen)', type: 'indicator', description: 'Precio promedio ponderado por volumen' }
    ],
    vwap_bands: [
      { name: 'vwap_plus_0_5', label: 'VWAP +0.5σ', type: 'indicator', description: 'VWAP + 0.5 desviaciones estándar' },
      { name: 'vwap_plus_1_0', label: 'VWAP +1.0σ', type: 'indicator', description: 'VWAP + 1.0 desviaciones estándar' },
      { name: 'vwap_plus_1_5', label: 'VWAP +1.5σ', type: 'indicator', description: 'VWAP + 1.5 desviaciones estándar' },
      { name: 'vwap_plus_2_0', label: 'VWAP +2.0σ', type: 'indicator', description: 'VWAP + 2.0 desviaciones estándar' },
      { name: 'vwap_plus_2_5', label: 'VWAP +2.5σ', type: 'indicator', description: 'VWAP + 2.5 desviaciones estándar' },
      { name: 'vwap_minus_0_5', label: 'VWAP -0.5σ', type: 'indicator', description: 'VWAP - 0.5 desviaciones estándar' },
      { name: 'vwap_minus_1_0', label: 'VWAP -1.0σ', type: 'indicator', description: 'VWAP - 1.0 desviaciones estándar' },
      { name: 'vwap_minus_1_5', label: 'VWAP -1.5σ', type: 'indicator', description: 'VWAP - 1.5 desviaciones estándar' },
      { name: 'vwap_minus_2_0', label: 'VWAP -2.0σ', type: 'indicator', description: 'VWAP - 2.0 desviaciones estándar' },
      { name: 'vwap_minus_2_5', label: 'VWAP -2.5σ', type: 'indicator', description: 'VWAP - 2.5 desviaciones estándar' }
    ],
    momentum: [
      { name: 'rsi', label: 'RSI (Índice de fuerza relativa)', type: 'indicator', description: 'Índice de fuerza relativa de 14 períodos' },
      { name: 'rsi_20', label: 'RSI 20 (Sobreventa extrema)', type: 'indicator', description: 'Nivel RSI de sobreventa extrema (20.0)' },
      { name: 'rsi_30', label: 'RSI 30 (Sobreventa estándar)', type: 'indicator', description: 'Nivel RSI de sobreventa estándar (30.0)' },
      { name: 'rsi_50', label: 'RSI 50 (Línea neutral)', type: 'indicator', description: 'Nivel RSI neutral (50.0)' },
      { name: 'rsi_70', label: 'RSI 70 (Sobrecompra estándar)', type: 'indicator', description: 'Nivel RSI de sobrecompra estándar (70.0)' },
      { name: 'rsi_80', label: 'RSI 80 (Sobrecompra extrema)', type: 'indicator', description: 'Nivel RSI de sobrecompra extrema (80.0)' },
      { name: 'macd', label: 'MACD (Convergencia/divergencia de medias móviles)', type: 'indicator', description: 'Línea MACD principal' },
      { name: 'macd_signal', label: 'MACD Signal', type: 'indicator', description: 'Línea de señal MACD' },
      { name: 'macd_histogram', label: 'MACD Histogram', type: 'indicator', description: 'Histograma MACD' },
      { name: 'stochastic_k', label: 'Stochastic %K', type: 'indicator', description: 'Estocástico %K de 14 períodos' },
      { name: 'stochastic_d', label: 'Stochastic %D', type: 'indicator', description: 'Estocástico %D de 14 períodos' }
    ],
    volatility: [
      { name: 'atr', label: 'ATR (Rango verdadero promedio)', type: 'indicator', description: 'Rango verdadero promedio de 14 períodos' },
      { name: 'bb_upper', label: 'Bollinger Bands Upper', type: 'indicator', description: 'Banda superior de Bollinger (20,2)' },
      { name: 'bb_middle', label: 'Bollinger Bands Middle', type: 'indicator', description: 'Banda media de Bollinger (20,2)' },
      { name: 'bb_lower', label: 'Bollinger Bands Lower', type: 'indicator', description: 'Banda inferior de Bollinger (20,2)' }
    ],
    price_data: [
      { name: 'open', label: 'Open (Precio de apertura)', type: 'price', description: 'Precio de apertura del período' },
      { name: 'high', label: 'High (Precio más alto)', type: 'price', description: 'Precio más alto del período' },
      { name: 'low', label: 'Low (Precio más bajo)', type: 'price', description: 'Precio más bajo del período' },
      { name: 'close', label: 'Close (Precio de cierre)', type: 'price', description: 'Precio de cierre del período' },
      { name: 'volume', label: 'Volume (Volumen)', type: 'volume', description: 'Volumen del período' }
    ]
  };

  const operators = [
    { value: 'gt', label: '>', description: 'Mayor que' },
    { value: 'lt', label: '<', description: 'Menor que' },
    { value: 'gte', label: '>=', description: 'Mayor o igual que' },
    { value: 'lte', label: '<=', description: 'Menor o igual que' },
    { value: 'eq', label: '==', description: 'Igual a' },
    { value: 'ne', label: '!=', description: 'Diferente de' },
    { value: 'cross_up', label: 'Cross Up', description: 'Cruza hacia arriba' },
    { value: 'cross_down', label: 'Cross Down', description: 'Cruza hacia abajo' }
  ];

  const actions = [
    { value: 'buy', label: 'Buy', description: 'Comprar' },
    { value: 'sell', label: 'Sell', description: 'Vender' },
    { value: 'close', label: 'Close', description: 'Cerrar posición' },
    { value: 'modify', label: 'Modify', description: 'Modificar orden' },
    { value: 'wait', label: 'Wait', description: 'Esperar' }
  ];

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setRuleForm(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleConditionChange = useCallback((index, field, value) => {
    setRuleForm(prev => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) => 
        i === index ? { ...condition, [field]: value } : condition
      )
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
    handleConditionChange(index, field, value);
  }, [handleConditionChange]);

  const handleSubmit = useCallback(() => {
    if (!ruleForm.name.trim()) {
      console.log('Rule name is empty');
      return;
    }
    
    // For condition rules, validate that at least one condition is complete
    if (ruleForm.rule_type === 'condition') {
      const hasValidCondition = ruleForm.conditions.some(condition => 
        condition.left_operand && condition.operator && condition.right_operand
      );
      
      if (!hasValidCondition) {
        console.log('No valid conditions');
        return;
      }
    }
    
    const newRule = {
      ...ruleForm,
      id: Date.now(),
      section: activeSection,
      order: rules.length + 1
    };
    
    console.log('Adding new rule:', newRule);
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
  }, [ruleForm, onAddRule, rules.length, activeSection]);

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

  const validateCondition = useCallback((condition) => {
    if (!condition.left_operand || !condition.operator || !condition.right_operand) {
      return false;
    }
    return true;
  }, []);

  const getValidationStatus = useCallback((condition) => {
    if (!condition.left_operand || !condition.operator || !condition.right_operand) {
      return 'error';
    }
    return 'valid';
  }, []);

  const canSubmitRule = useCallback(() => {
    if (!ruleForm.name.trim()) return false;
    
    if (ruleForm.rule_type === 'condition') {
      return ruleForm.conditions.some(condition => 
        condition.left_operand && condition.operator && condition.right_operand
      );
    }
    
    return true;
  }, [ruleForm]);

  const renderConditionRuleForm = () => (
    <div className="condition-rule-form">
      <div className="conditions-container">
        <div className="conditions-header">
          <h4>Rule Conditions</h4>
          <button onClick={addCondition} className="btn btn-primary btn-sm">
            <FaPlus /> Add Condition
          </button>
        </div>
        
        {ruleForm.conditions.map((condition, index) => (
          <div key={index} className="condition-group">
            <div className="condition-header">
              <span className="condition-number">Condition {index + 1}</span>
              {index > 0 && (
                <select
                  value={condition.logical_operator}
                  onChange={(e) => updateCondition(index, 'logical_operator', e.target.value)}
                  className="logical-operator"
                >
                  <option value="and">AND</option>
                  <option value="or">OR</option>
                </select>
              )}
              {ruleForm.conditions.length > 1 && (
                <button 
                  onClick={() => removeCondition(index)}
                  className="btn btn-danger btn-sm"
                >
                  <FaTrash />
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
                      {op.label} - {op.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Right Indicator/Value</label>
                <select
                  value={condition.right_operand}
                  onChange={(e) => updateCondition(index, 'right_operand', e.target.value)}
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
            </div>
            
            <div className={`validation-status ${getValidationStatus(condition)}`}>
              {getValidationStatus(condition) === 'error' ? '⚠️ Incomplete condition' : '✅ Valid condition'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderActionRuleForm = () => (
    <div className="action-rule-form">
      <div className="form-group">
        <label>Action Type</label>
        <select
          name="action_type"
          value={ruleForm.action_type}
          onChange={handleInputChange}
        >
          {actions.map(action => (
            <option key={action.value} value={action.value}>
              {action.label} - {action.description}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const getSectionRules = useCallback((section) => {
    return rules.filter(rule => rule.section === section);
  }, [rules]);

  const currentRules = getSectionRules(activeSection);
  const sectionIcon = activeSection === 'entry' ? <FaShoppingCart /> : <FaMoneyBillWave />;
  const sectionTitle = activeSection === 'entry' ? 'Entry Rules' : 'Exit Rules';
  const sectionDescription = activeSection === 'entry' ? 'When to buy - define your entry conditions' : 'When to sell - define your exit conditions';

  return (
    <div className="rule-builder">
      <div className="rule-builder-header">
        <h4>{sectionIcon} {sectionTitle}</h4>
        <p>{sectionDescription}</p>
        {!readOnly && (
          <button
            onClick={() => setShowRuleForm(!showRuleForm)}
            className="btn btn-primary btn-sm"
          >
            {showRuleForm ? <FaTimes /> : <FaPlus />} {showRuleForm ? 'Cancel' : `Add ${activeSection === 'entry' ? 'Entry' : 'Exit'} Rule`}
          </button>
        )}
      </div>

      {showRuleForm && (
        <div className="rule-form-inline">
          <div className="rule-form-header">
            <h5>Add New {activeSection === 'entry' ? 'Entry' : 'Exit'} Rule</h5>
          </div>

          <div className="rule-form-body">
            <div className="form-group">
              <label>Rule Name *</label>
              <input
                type="text"
                name="name"
                value={ruleForm.name}
                onChange={handleInputChange}
                placeholder={`e.g., ${activeSection === 'entry' ? 'RSI Oversold Entry' : 'RSI Overbought Exit'}`}
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
              <button 
                onClick={handleSubmit} 
                className="btn btn-primary"
                disabled={!canSubmitRule()}
              >
                Add Rule
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rules-section">
        {currentRules.length === 0 ? (
          <div className="empty-rules">
            <p>No {activeSection} rules yet. Add your first {activeSection} condition!</p>
          </div>
        ) : (
          <div className="rules-list">
            {currentRules.map((rule, index) => (
              <div key={rule.id} className={`rule-item ${activeSection}-rule`}>
                <div className="rule-header">
                  <span className="rule-order">{rule.order}</span>
                  <span className="rule-name">{rule.name}</span>
                  <span className={`rule-type ${rule.rule_type}`}>
                    {rule.rule_type === 'condition' ? 'Condition' : 'Action'}
                  </span>
                </div>
                <div className="rule-details">
                  {rule.rule_type === 'condition' && rule.conditions && (
                    <div className="rule-conditions-preview">
                      {rule.conditions.map((condition, idx) => (
                        <div key={idx} className="condition-preview">
                          <span className="condition-text">
                            {condition.left_operand} {condition.operator} {condition.right_operand}
                          </span>
                          {idx < rule.conditions.length - 1 && (
                            <span className="logical-operator">
                              {condition.logical_operator === 'and' ? 'AND' : 'OR'}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {rule.rule_type === 'action' && (
                    <span>{rule.action_type}</span>
                  )}
                </div>
                {!readOnly && (
                  <div className="rule-actions">
                    <button
                      onClick={() => onMoveRule(rule.id, 'up')}
                      disabled={index === 0}
                      className="btn btn-sm btn-secondary"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => onMoveRule(rule.id, 'down')}
                      disabled={index === currentRules.length - 1}
                      className="btn btn-sm btn-secondary"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => onRemoveRule(rule.id)}
                      className="btn btn-sm btn-danger"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RuleBuilder;
