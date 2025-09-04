import React, { useState } from 'react';
import { FaPlus, FaTrash, FaCog, FaChartLine, FaTimes, FaEquals, FaGreaterThan, FaLessThan, FaGreaterThanEqual, FaLessThanEqual, FaNotEqual } from 'react-icons/fa';

const RuleBuilder = ({ onRulesChange, initialRules = { entryRules: [], exitRules: [] } }) => {
  const [rules, setRules] = useState(initialRules);

  // Opciones disponibles
  const priceOptions = [
    { value: 'close', label: 'Close Price' },
    { value: 'open', label: 'Open Price' },
    { value: 'high', label: 'High Price' },
    { value: 'low', label: 'Low Price' },
    { value: 'volume', label: 'Volume' }
  ];

  const indicatorOptions = [
    { value: 'sma', label: 'SMA (Simple Moving Average)' },
    { value: 'ema', label: 'EMA (Exponential Moving Average)' },
    { value: 'rsi', label: 'RSI (Relative Strength Index)' },
    { value: 'macd', label: 'MACD' },
    { value: 'bollinger_upper', label: 'Bollinger Bands Upper' },
    { value: 'bollinger_lower', label: 'Bollinger Bands Lower' },
    { value: 'stoch', label: 'Stochastic' },
    { value: 'williams_r', label: 'Williams %R' },
    { value: 'atr', label: 'ATR (Average True Range)' }
  ];

  const operatorOptions = [
    { value: '>', label: 'Greater Than', icon: FaGreaterThan },
    { value: '<', label: 'Less Than', icon: FaLessThan },
    { value: '>=', label: 'Greater or Equal', icon: FaGreaterThanEqual },
    { value: '<=', label: 'Less or Equal', icon: FaLessThanEqual },
    { value: '==', label: 'Equals', icon: FaEquals },
    { value: '!=', label: 'Not Equals', icon: FaNotEqual }
  ];

  const logicalOperators = [
    { value: 'AND', label: 'AND' },
    { value: 'OR', label: 'OR' }
  ];


  // Estructura de una condición
  const createCondition = () => ({
    id: Date.now() + Math.random(),
    type: 'price', // 'price' o 'indicator' - primer valor
    field: 'close',
    operator: '>',
    secondType: 'number', // 'price', 'indicator' o 'number' - segundo valor
    value: '',
    period: 20 // Para indicadores
  });

  // Estructura de una regla
  const createRule = () => ({
    id: Date.now() + Math.random(),
    conditions: [createCondition()],
    logicalOperators: [] // AND/OR entre condiciones
  });

  const addRule = (ruleType) => {
    const newRule = createRule();
    setRules(prev => ({
      ...prev,
      [ruleType]: [...prev[ruleType], newRule]
    }));
  };

  const removeRule = (ruleType, ruleId) => {
    setRules(prev => ({
      ...prev,
      [ruleType]: prev[ruleType].filter(rule => rule.id !== ruleId)
    }));
  };

  const addCondition = (ruleType, ruleId) => {
    const newCondition = createCondition();
    setRules(prev => ({
      ...prev,
      [ruleType]: prev[ruleType].map(rule => 
        rule.id === ruleId 
          ? { 
              ...rule, 
              conditions: [...rule.conditions, newCondition],
              logicalOperators: [...rule.logicalOperators, 'AND']
            }
          : rule
      )
    }));
  };

  const removeCondition = (ruleType, ruleId, conditionId) => {
    setRules(prev => ({
      ...prev,
      [ruleType]: prev[ruleType].map(rule => 
        rule.id === ruleId 
          ? { 
              ...rule, 
              conditions: rule.conditions.filter(cond => cond.id !== conditionId),
              logicalOperators: rule.logicalOperators.filter((_, index) => index < rule.conditions.length - 1)
            }
          : rule
      )
    }));
  };

  const updateCondition = (ruleType, ruleId, conditionId, field, value) => {
    setRules(prev => ({
      ...prev,
      [ruleType]: prev[ruleType].map(rule => 
        rule.id === ruleId 
          ? {
              ...rule,
              conditions: rule.conditions.map(cond => 
                cond.id === conditionId 
                  ? { ...cond, [field]: value }
                  : cond
              )
            }
          : rule
      )
    }));
  };

  const updateLogicalOperator = (ruleType, ruleId, index, operator) => {
    setRules(prev => ({
      ...prev,
      [ruleType]: prev[ruleType].map(rule => 
        rule.id === ruleId 
          ? {
              ...rule,
              logicalOperators: rule.logicalOperators.map((op, i) => 
                i === index ? operator : op
              )
            }
          : rule
      )
    }));
  };

  // Notificar cambios al componente padre
  React.useEffect(() => {
    if (onRulesChange) {
      onRulesChange(rules);
    }
  }, [rules, onRulesChange]);

  const renderCondition = (condition, ruleType, ruleId, conditionIndex) => {
    const OperatorIcon = operatorOptions.find(op => op.value === condition.operator)?.icon || FaEquals;

    return (
      <div key={condition.id} className="condition">
        <div className="condition-header">
          <span className="condition-number">Condition {conditionIndex + 1}</span>
          {conditionIndex > 0 && (
            <div className="logical-operator">
              <select
                value={rules[ruleType].find(r => r.id === ruleId)?.logicalOperators[conditionIndex - 1] || 'AND'}
                onChange={(e) => updateLogicalOperator(ruleType, ruleId, conditionIndex - 1, e.target.value)}
                className="logical-select"
              >
                {logicalOperators.map(op => (
                  <option key={op.value} value={op.value}>{op.value}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="condition-content">
          <div className="condition-row">
            <div className="condition-field">
              <label>First Value</label>
              <select
                value={condition.type}
                onChange={(e) => updateCondition(ruleType, ruleId, condition.id, 'type', e.target.value)}
                className="condition-select"
              >
                <option value="price">Price</option>
                <option value="indicator">Indicator</option>
              </select>
            </div>

            <div className="condition-field">
              <label>Field</label>
              <select
                value={condition.field}
                onChange={(e) => updateCondition(ruleType, ruleId, condition.id, 'field', e.target.value)}
                className="condition-select"
              >
                {condition.type === 'price' ? (
                  priceOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))
                ) : (
                  indicatorOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))
                )}
              </select>
            </div>

            <div className="condition-field">
              <label>Operator</label>
              <div className="operator-select">
                <OperatorIcon className="operator-icon" />
                <select
                  value={condition.operator}
                  onChange={(e) => updateCondition(ruleType, ruleId, condition.id, 'operator', e.target.value)}
                  className="condition-select"
                >
                  {operatorOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="condition-field">
              <label>Second Value</label>
              <select
                value={condition.secondType || 'price'}
                onChange={(e) => updateCondition(ruleType, ruleId, condition.id, 'secondType', e.target.value)}
                className="condition-select"
              >
                <option value="price">Price</option>
                <option value="indicator">Indicator</option>
                <option value="number">Number</option>
              </select>
            </div>

            <div className="condition-field">
              <label>Value</label>
              {condition.secondType === 'number' ? (
                <input
                  type="number"
                  value={condition.value}
                  onChange={(e) => updateCondition(ruleType, ruleId, condition.id, 'value', e.target.value)}
                  placeholder="Enter value"
                  className="condition-input"
                />
              ) : (
                <select
                  value={condition.value}
                  onChange={(e) => updateCondition(ruleType, ruleId, condition.id, 'value', e.target.value)}
                  className="condition-select"
                >
                  {condition.secondType === 'price' ? (
                    priceOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))
                  ) : (
                    indicatorOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))
                  )}
                </select>
              )}
            </div>

            {condition.secondType === 'indicator' && (
              <div className="condition-field">
                <label>Period</label>
                <input
                  type="number"
                  value={condition.period}
                  onChange={(e) => updateCondition(ruleType, ruleId, condition.id, 'period', e.target.value)}
                  placeholder="20"
                  className="condition-input"
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => removeCondition(ruleType, ruleId, condition.id)}
              className="remove-condition-btn"
              title="Remove condition"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderRule = (rule, ruleType, ruleIndex) => (
    <div key={rule.id} className="rule">
      <div className="rule-header">
        <h4>
          <FaCog />
          {ruleType === 'entryRules' ? 'Entry' : 'Exit'} Rule {ruleIndex + 1}
        </h4>
        <button
          type="button"
          onClick={() => removeRule(ruleType, rule.id)}
          className="remove-rule-btn"
          title="Remove rule"
        >
          <FaTrash />
        </button>
      </div>

      <div className="rule-content">
        {rule.conditions.map((condition, conditionIndex) => 
          renderCondition(condition, ruleType, rule.id, conditionIndex)
        )}

        <button
          type="button"
          onClick={() => addCondition(ruleType, rule.id)}
          className="add-condition-btn"
        >
          <FaPlus />
          Add Condition
        </button>
      </div>
    </div>
  );

  return (
    <div className="rule-builder">
      <div className="rule-builder-header">
        <h3>
          <FaChartLine />
          Rule Builder
        </h3>
        <p>Create complex trading rules using technical indicators and price conditions</p>
      </div>

      <div className="rules-container">
        <div className="rule-section">
          <div className="rule-section-header">
            <h4>Entry Rules</h4>
            <button
              type="button"
              onClick={() => addRule('entryRules')}
              className="add-rule-btn"
            >
              <FaPlus />
              Add Entry Rule
            </button>
          </div>

          <div className="rules-list">
            {rules.entryRules.map((rule, index) => 
              renderRule(rule, 'entryRules', index)
            )}
          </div>
        </div>

        <div className="rule-section">
          <div className="rule-section-header">
            <h4>Exit Rules</h4>
            <button
              type="button"
              onClick={() => addRule('exitRules')}
              className="add-rule-btn"
            >
              <FaPlus />
              Add Exit Rule
            </button>
          </div>

          <div className="rules-list">
            {rules.exitRules.map((rule, index) => 
              renderRule(rule, 'exitRules', index)
            )}
          </div>
        </div>
      </div>

      <div className="rule-builder-summary">
        <h4>Rule Summary</h4>
        <div className="summary-content">
          <div className="summary-item">
            <strong>Entry Rules:</strong> {rules.entryRules.length}
          </div>
          <div className="summary-item">
            <strong>Exit Rules:</strong> {rules.exitRules.length}
          </div>
          <div className="summary-item">
            <strong>Total Conditions:</strong> {
              rules.entryRules.reduce((acc, rule) => acc + rule.conditions.length, 0) +
              rules.exitRules.reduce((acc, rule) => acc + rule.conditions.length, 0)
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuleBuilder;