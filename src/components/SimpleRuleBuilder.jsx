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
import './SimpleRuleBuilder.css';

const SimpleRuleBuilder = ({ onAddRule, onRemoveRule, onMoveRule, rules, activeSection, readOnly = false }) => {
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    action_type: activeSection === 'entry' ? 'buy' : 'close',
    conditions: [
      {
        left_operand: '',
        operator: 'gt',
        right_operand: '',
        logical_operator: 'and',
        custom_value: ''
      }
    ],
    priority: 1,
    parameters: {}
  });

  // Available indicators and their configurations
  const indicators = {
    price: [
      { value: 'close', label: 'Close Price' },
      { value: 'high', label: 'High Price' },
      { value: 'low', label: 'Low Price' },
      { value: 'open', label: 'Open Price' }
    ],
    moving_averages: [
      { value: 'sma_20', label: 'SMA 20' },
      { value: 'sma_50', label: 'SMA 50' },
      { value: 'sma_200', label: 'SMA 200' },
      { value: 'ema_12', label: 'EMA 12' },
      { value: 'ema_26', label: 'EMA 26' },
      { value: 'ema_50', label: 'EMA 50' }
    ],
    vwap: [
      { value: 'vwap', label: 'VWAP' },
      { value: 'vwap_plus_0_5', label: 'VWAP +0.5σ' },
      { value: 'vwap_plus_1_0', label: 'VWAP +1.0σ' },
      { value: 'vwap_plus_1_5', label: 'VWAP +1.5σ' },
      { value: 'vwap_plus_2_0', label: 'VWAP +2.0σ' },
      { value: 'vwap_plus_2_5', label: 'VWAP +2.5σ' },
      { value: 'vwap_minus_0_5', label: 'VWAP -0.5σ' },
      { value: 'vwap_minus_1_0', label: 'VWAP -1.0σ' },
      { value: 'vwap_minus_1_5', label: 'VWAP -1.5σ' },
      { value: 'vwap_minus_2_0', label: 'VWAP -2.0σ' },
      { value: 'vwap_minus_2_5', label: 'VWAP -2.5σ' }
    ],
    oscillators: [
      { value: 'rsi_20', label: 'RSI 20' },
      { value: 'rsi_30', label: 'RSI 30' },
      { value: 'rsi_50', label: 'RSI 50' },
      { value: 'rsi_70', label: 'RSI 70' },
      { value: 'rsi_80', label: 'RSI 80' },
      { value: 'stoch_k', label: 'Stochastic %K' },
      { value: 'stoch_d', label: 'Stochastic %D' },
      { value: 'williams_r', label: 'Williams %R' },
      { value: 'cci_20', label: 'CCI 20' }
    ],
    volatility: [
      { value: 'atr', label: 'ATR' },
      { value: 'bb_upper', label: 'Bollinger Upper' },
      { value: 'bb_middle', label: 'Bollinger Middle' },
      { value: 'bb_lower', label: 'Bollinger Lower' }
    ],
    volume: [
      { value: 'volume', label: 'Volume' },
      { value: 'volume_sma', label: 'Volume SMA' },
      { value: 'obv', label: 'OBV' },
      { value: 'ad_line', label: 'A/D Line' }
    ]
  };

  // Pre-calculated indicator values
  const indicatorValues = {
    'rsi_20': [15, 20, 25, 30],
    'rsi_30': [25, 30, 35, 40],
    'rsi_50': [45, 50, 55, 60],
    'rsi_70': [65, 70, 75, 80],
    'rsi_80': [75, 80, 85, 90],
    'stoch_k': [20, 30, 50, 70, 80],
    'stoch_d': [20, 30, 50, 70, 80],
    'williams_r': [-80, -70, -50, -30, -20],
    'cci_20': [-100, -50, 0, 50, 100],
    'atr': [0.5, 1.0, 1.5, 2.0, 2.5, 3.0],
    'bb_upper': [1.0, 1.5, 2.0, 2.5],
    'bb_middle': [0.5, 1.0, 1.5, 2.0],
    'bb_lower': [1.0, 1.5, 2.0, 2.5],
    'volume': [1000, 5000, 10000, 50000, 100000],
    'volume_sma': [1000, 5000, 10000, 50000, 100000]
  };

  const operators = [
    { value: 'gt', label: 'Greater Than (>)', icon: <FaGreaterThan /> },
    { value: 'lt', label: 'Less Than (<)', icon: <FaLessThan /> },
    { value: 'eq', label: 'Equals (=)', icon: <FaEquals /> },
    { value: 'gte', label: 'Greater or Equal (>=)', icon: <FaArrowUp /> },
    { value: 'lte', label: 'Less or Equal (<=)', icon: <FaArrowDown /> }
  ];

  const logicalOperators = [
    { value: 'and', label: 'AND' },
    { value: 'or', label: 'OR' }
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
      conditions: prev.conditions.map((condition, i) => {
        if (i === index) {
          const updatedCondition = { ...condition, [field]: value };
          
          // If changing right_operand away from __custom__, clear custom_value
          if (field === 'right_operand' && value !== '__custom__') {
            delete updatedCondition.custom_value;
          }
          
          return updatedCondition;
        }
        return condition;
      })
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
          logical_operator: 'and',
          custom_value: ''
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

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    // Process conditions to handle custom values
    const processedConditions = ruleForm.conditions.map(condition => {
      if (condition.right_operand === '__custom__' && condition.custom_value) {
        return {
          ...condition,
          right_operand: condition.custom_value
        };
      }
      return condition;
    });
    
    // Validate that at least one condition is complete
    const hasValidCondition = processedConditions.some(condition => 
      condition.left_operand && condition.operator && condition.right_operand
    );
    
    if (!hasValidCondition) {
      return;
    }
    
    const newRule = {
      id: Date.now(),
      name: `${activeSection === 'entry' ? 'Entry' : 'Exit'} Rule ${rules.length + 1}`,
      rule_type: 'condition',
      condition_type: 'indicator',
      action_type: ruleForm.action_type,
      conditions: processedConditions,
      priority: ruleForm.priority,
      order: rules.length + 1,
      section: activeSection,
      parameters: ruleForm.parameters
    };
    
    onAddRule(newRule);
    
    // Reset form
    setShowRuleForm(false);
    setRuleForm({
      action_type: activeSection === 'entry' ? 'buy' : 'close',
      conditions: [
        {
          left_operand: '',
          operator: 'gt',
          right_operand: '',
          logical_operator: 'and',
          custom_value: ''
        }
      ],
      priority: 1,
      parameters: {}
    });
  }, [ruleForm, activeSection, rules.length, onAddRule]);

  const handleCancel = useCallback(() => {
    setShowRuleForm(false);
    setRuleForm({
      action_type: activeSection === 'entry' ? 'buy' : 'close',
      conditions: [
        {
          left_operand: '',
          operator: 'gt',
          right_operand: '',
          logical_operator: 'and',
          custom_value: ''
        }
      ],
      priority: 1,
      parameters: {}
    });
  }, [activeSection]);

  const canSubmitRule = useCallback(() => {
    return ruleForm.conditions.some(condition => {
      const hasLeftOperand = condition.left_operand;
      const hasOperator = condition.operator;
      const hasRightOperand = condition.right_operand;
      const hasCustomValue = condition.right_operand === '__custom__' && condition.custom_value;
      
      return hasLeftOperand && hasOperator && (hasRightOperand || hasCustomValue);
    });
  }, [ruleForm.conditions]);

  const renderValueInput = useCallback((condition, index) => {
    const hasPreCalculatedValues = indicatorValues[condition.left_operand];
    
    return (
      <select
        value={condition.right_operand}
        onChange={(e) => handleConditionChange(index, 'right_operand', e.target.value)}
      >
        <option value="">Select Value or Indicator</option>
        
        {/* Pre-calculated values for the selected indicator */}
        {hasPreCalculatedValues && (
          <optgroup label="Pre-calculated Values">
            {hasPreCalculatedValues.map(value => (
              <option key={value} value={value}>{value}</option>
            ))}
          </optgroup>
        )}
        
        {/* All available indicators for comparison */}
        {Object.entries(indicators).map(([category, items]) => (
          <optgroup key={category} label={`Compare with ${category.replace('_', ' ').toUpperCase()}`}>
            {items.map(item => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </optgroup>
        ))}
        
        {/* Custom numeric value option */}
        <optgroup label="Custom Value">
          <option value="__custom__">Enter Custom Value</option>
        </optgroup>
      </select>
    );
  }, [handleConditionChange]);

  const getOrderedIndicators = useCallback(() => {
    if (activeSection === 'exit') {
      // For exit rules, put volatility first
      const orderedEntries = Object.entries(indicators);
      const volatilityIndex = orderedEntries.findIndex(([category]) => category === 'volatility');
      
      if (volatilityIndex > 0) {
        const volatilityEntry = orderedEntries.splice(volatilityIndex, 1)[0];
        return [volatilityEntry, ...orderedEntries];
      }
    }
    
    // For entry rules, use default order
    return Object.entries(indicators);
  }, [activeSection]);

  const renderConditionForm = useCallback(() => (
    <div className="conditions-form">
      <h4>Conditions</h4>
      {ruleForm.conditions.map((condition, index) => (
        <div key={index} className="condition-form">
          {index > 0 && (
            <div className="logical-operator">
              <select
                value={condition.logical_operator}
                onChange={(e) => handleConditionChange(index, 'logical_operator', e.target.value)}
              >
                {logicalOperators.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="condition-inputs">
            <select
              value={condition.left_operand}
              onChange={(e) => handleConditionChange(index, 'left_operand', e.target.value)}
            >
              <option value="">Select Indicator</option>
              {getOrderedIndicators().map(([category, items]) => (
                <optgroup key={category} label={category.replace('_', ' ').toUpperCase()}>
                  {items.map(item => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            
            <select
              value={condition.operator}
              onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
            >
              {operators.map(op => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
            
            {renderValueInput(condition, index)}
            
            {/* Custom value input - only show when __custom__ is selected */}
            {condition.right_operand === '__custom__' && (
              <input
                type="number"
                placeholder="Enter custom value"
                value={condition.custom_value || ''}
                onChange={(e) => handleConditionChange(index, 'custom_value', e.target.value)}
                style={{ marginTop: '0.5rem' }}
              />
            )}
            
            <button
              type="button"
              onClick={() => removeCondition(index)}
              className="btn btn-danger btn-sm"
              disabled={ruleForm.conditions.length === 1}
            >
              <FaTimes />
            </button>
          </div>
        </div>
      ))}
      
      <button
        type="button"
        onClick={addCondition}
        className="btn btn-secondary btn-sm"
      >
        <FaPlus /> Add Condition
      </button>
    </div>
  ), [ruleForm.conditions, handleConditionChange, removeCondition, addCondition, renderValueInput]);

  const renderRuleForm = () => (
    <div className="rule-form-inline">
      <div className="rule-form-header">
        <h3>Add {activeSection === 'entry' ? 'Entry' : 'Exit'} Rule</h3>
        <button onClick={handleCancel} className="btn btn-secondary btn-sm">
          <FaTimes />
        </button>
      </div>
      
              <form onSubmit={handleSubmit}>
          {activeSection === 'entry' && (
            <div className="form-group">
              <label>Action *</label>
              <select
                name="action_type"
                value={ruleForm.action_type}
                onChange={handleInputChange}
              >
                <option value="buy">Buy (Long)</option>
                <option value="sell">Sell (Short)</option>
              </select>
            </div>
          )}
          
          {activeSection === 'exit' && (
            <div className="form-group">
              <label>Action</label>
              <div className="action-display">
                <span className="action-badge">Close Position</span>
                <span className="action-description">Exit rules automatically close positions</span>
              </div>
            </div>
          )}

        {renderConditionForm()}

        <div className="rule-form-actions">
          <button onClick={handleCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!canSubmitRule()}
          >
            Add Rule
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="rule-builder">
      <div className="rule-builder-header">
        <h3>{activeSection === 'entry' ? 'Entry' : 'Exit'} Rules</h3>
        {!readOnly && (
          <button
            onClick={() => setShowRuleForm(true)}
            className="btn btn-primary"
          >
            <FaPlus /> Add {activeSection === 'entry' ? 'Entry' : 'Exit'} Rule
          </button>
        )}
      </div>
      
      <div className="rules-list">
        {rules.length === 0 && !showRuleForm ? (
          <div className="no-rules">
            <p>No {activeSection} rules defined yet.</p>
            <p>Click "Add {activeSection === 'entry' ? 'Entry' : 'Exit'} Rule" to get started.</p>
          </div>
        ) : (
          <>
            {rules.map((rule, index) => (
            <div key={index} className="rule-item">
              <div className="rule-header">
                <span className="rule-order">{rule.order}</span>
                <span className="rule-name">{rule.name}</span>
                <span className={`action-type ${rule.action_type}`}>
                  {rule.action_type === 'buy' ? 'Buy (Long)' : 
                   rule.action_type === 'sell' ? 'Sell (Short)' : 
                   'Close Position'}
                </span>
              </div>
              <div className="rule-details">
                {rule.conditions && (
                  <div className="rule-conditions-preview">
                    {rule.conditions.map((condition, idx) => (
                      <div key={idx} className="condition-preview">
                        {idx > 0 && <span className="logical-op">{condition.logical_operator.toUpperCase()}</span>}
                        <span className="condition-text">
                          {condition.left_operand} {operators.find(op => op.value === condition.operator)?.label} {condition.right_operand}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {!readOnly && (
                <div className="rule-actions">
                  <button
                    onClick={() => onRemoveRule(rule.id)}
                    className="btn btn-danger btn-sm"
                  >
                    <FaTrash />
                  </button>
                </div>
              )}
            </div>
          ))
            }
          </>
        )}
      </div>
      
      {showRuleForm && renderRuleForm()}
    </div>
  );
};

export default SimpleRuleBuilder;
