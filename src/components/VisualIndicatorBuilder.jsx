import React, { useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import './VisualIndicatorBuilder.css';

const VisualIndicatorBuilder = ({ conditions, onChange, maxConditions = 5 }) => {
  const [localConditions, setLocalConditions] = useState(conditions || []);

  // Grouped indicators with parameters
  const indicatorGroups = {
    'Moving Averages': [
      { value: 'sma_20', label: 'SMA 20', customizable: true, baseType: 'sma' },
      { value: 'sma_50', label: 'SMA 50', customizable: true, baseType: 'sma' },
      { value: 'sma_200', label: 'SMA 200', customizable: true, baseType: 'sma' },
      { value: 'ema_20', label: 'EMA 20', customizable: true, baseType: 'ema' },
      { value: 'ema_50', label: 'EMA 50', customizable: true, baseType: 'ema' },
      { value: 'ema_200', label: 'EMA 200', customizable: true, baseType: 'ema' },
      { value: 'vwap', label: 'VWAP' }
    ],
    'Momentum': [
      { value: 'rsi', label: 'RSI', customizable: true },
      { value: 'macd', label: 'MACD' },
      { value: 'macd_signal', label: 'MACD Signal' },
      { value: 'macd_histogram', label: 'MACD Histogram' },
      { value: 'stochastic_k', label: 'Stochastic %K' },
      { value: 'stochastic_d', label: 'Stochastic %D' }
    ],
    'Volatility': [
      { value: 'atr', label: 'ATR' },
      { value: 'bb_upper', label: 'Bollinger Upper' },
      { value: 'bb_middle', label: 'Bollinger Middle' },
      { value: 'bb_lower', label: 'Bollinger Lower' }
    ],
    'Price & Volume': [
      { value: 'open', label: 'Open' },
      { value: 'high', label: 'High' },
      { value: 'low', label: 'Low' },
      { value: 'close', label: 'Close' },
      { value: 'volume', label: 'Volume' }
    ]
  };

  const operators = [
    { value: 'gt', label: '>' },
    { value: 'lt', label: '<' },
    { value: 'gte', label: '>=' },
    { value: 'lte', label: '<=' },
    { value: 'eq', label: '=' },
    { value: 'cross_up', label: 'crosses above' },
    { value: 'cross_down', label: 'crosses below' }
  ];

  const handleAddCondition = () => {
    if (localConditions.length >= maxConditions) {
      return;
    }

    const newCondition = {
      left_operand: 'close',
      operator: 'gt',
      right_operand: 'sma_20',
      logical_operator: 'and'
    };

    const updated = [...localConditions, newCondition];
    setLocalConditions(updated);
    onChange(updated);
  };

  const handleRemoveCondition = (index) => {
    const updated = localConditions.filter((_, i) => i !== index);
    setLocalConditions(updated);
    onChange(updated);
  };

  const handleConditionChange = (index, field, value) => {
    const updated = [...localConditions];
    updated[index] = { ...updated[index], [field]: value };
    setLocalConditions(updated);
    onChange(updated);
  };

  const getAllIndicators = () => {
    const all = [];
    Object.values(indicatorGroups).forEach(group => {
      all.push(...group);
    });
    return all;
  };

  const isNumericOperand = (operand) => {
    return !isNaN(parseFloat(operand)) || getAllIndicators().some(ind => ind.value === operand);
  };

  return (
    <div className="visual-indicator-builder">
      <div className="conditions-list">
        {localConditions.length === 0 && (
          <div className="no-conditions">
            <p>No conditions yet. Click "Add Condition" to get started.</p>
          </div>
        )}

        {localConditions.map((condition, index) => (
          <div key={index} className="condition-row">
            {index > 0 && (
              <div className="logical-operator-selector">
                <select
                  value={condition.logical_operator || 'and'}
                  onChange={(e) => handleConditionChange(index, 'logical_operator', e.target.value)}
                >
                  <option value="and">AND</option>
                  <option value="or">OR</option>
                </select>
              </div>
            )}

            <div className="condition-inputs">
              <div className="condition-input">
                <label>Indicator</label>
                <select
                  value={condition.left_operand}
                  onChange={(e) => handleConditionChange(index, 'left_operand', e.target.value)}
                >
                  {Object.entries(indicatorGroups).map(([groupName, indicators]) => (
                    <optgroup key={groupName} label={groupName}>
                      {indicators.map(ind => (
                        <option key={ind.value} value={ind.value}>
                          {ind.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="condition-input">
                <label>Operator</label>
                <select
                  value={condition.operator}
                  onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="condition-input">
                <label>Compare To</label>
                <input
                  type="text"
                  value={condition.right_operand}
                  onChange={(e) => handleConditionChange(index, 'right_operand', e.target.value)}
                  placeholder="e.g., 50, sma_20"
                  list={`indicators-list-${index}`}
                />
                <datalist id={`indicators-list-${index}`}>
                  {getAllIndicators().map(ind => (
                    <option key={ind.value} value={ind.value}>
                      {ind.label}
                    </option>
                  ))}
                </datalist>
              </div>

              <button
                className="remove-condition-btn"
                onClick={() => handleRemoveCondition(index)}
                title="Remove condition"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        className="add-condition-btn"
        onClick={handleAddCondition}
        disabled={localConditions.length >= maxConditions}
      >
        <FaPlus />
        Add Condition {localConditions.length > 0 && `(${localConditions.length}/${maxConditions})`}
      </button>

      {localConditions.length >= maxConditions && (
        <div className="max-conditions-warning">
          <p>Maximum {maxConditions} conditions reached</p>
        </div>
      )}
    </div>
  );
};

export default VisualIndicatorBuilder;

