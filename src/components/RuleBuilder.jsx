import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaCog, FaChartLine, FaTimes, FaEquals, FaGreaterThan, FaLessThan, FaGreaterThanEqual, FaLessThanEqual, FaNotEqual } from 'react-icons/fa';

const RuleBuilder = ({ onRulesChange, initialRules = { entryRules: [], exitRules: [] } }) => {
  const [rules, setRules] = useState(initialRules);

  // Hierarchical options with subcategories
  const hierarchicalOptions = [
    {
      category: 'Price',
      options: [
        { value: 'close', label: 'Close Price' },
        { value: 'open', label: 'Open Price' },
        { value: 'high', label: 'High Price' },
        { value: 'low', label: 'Low Price' }
      ]
    },
    {
      category: 'Volume',
      options: [
        { value: 'volume', label: 'Volume' },
        { value: 'vwap', label: 'VWAP' },
        { value: 'vwap_-2sd', label: 'VWAP -2SD' },
        { value: 'vwap_-1sd', label: 'VWAP -1SD' },
        { value: 'vwap_+0.5sd', label: 'VWAP +0.5SD' },
        { value: 'vwap_+1sd', label: 'VWAP +1SD' },
        { value: 'vwap_+2sd', label: 'VWAP +2SD' },
        { value: 'obv', label: 'OBV (On Balance Volume)' },
        { value: 'ad_line', label: 'A/D Line' }
      ]
    },
    {
      category: 'Oscillators',
      options: [
        { value: 'rsi_20', label: 'RSI 20 (Oversold)' },
        { value: 'rsi_30', label: 'RSI 30 (Oversold)' },
        { value: 'rsi_50', label: 'RSI 50 (Center)' },
        { value: 'rsi_70', label: 'RSI 70 (Overbought)' },
        { value: 'rsi_80', label: 'RSI 80 (Overbought)' },
        { value: 'stoch_20', label: 'Stochastic 20' },
        { value: 'stoch_80', label: 'Stochastic 80' },
        { value: 'williams_r_20', label: 'Williams %R -20' },
        { value: 'williams_r_80', label: 'Williams %R -80' },
        { value: 'cci_100', label: 'CCI -100' },
        { value: 'cci_100', label: 'CCI +100' }
      ]
    },
    {
      category: 'Trend',
      options: [
        { value: 'sma_20', label: 'SMA 20' },
        { value: 'sma_50', label: 'SMA 50' },
        { value: 'sma_200', label: 'SMA 200' },
        { value: 'ema_12', label: 'EMA 12' },
        { value: 'ema_26', label: 'EMA 26' },
        { value: 'ema_50', label: 'EMA 50' },
        { value: 'macd', label: 'MACD' },
        { value: 'macd_signal', label: 'MACD Signal' },
        { value: 'macd_histogram', label: 'MACD Histogram' }
      ]
    },
    {
      category: 'Volatility',
      options: [
        { value: 'bb_upper', label: 'Bollinger Upper Band' },
        { value: 'bb_lower', label: 'Bollinger Lower Band' },
        { value: 'bb_middle', label: 'Bollinger Middle Band' },
        { value: 'atr_14', label: 'ATR 14' },
        { value: 'atr_21', label: 'ATR 21' }
      ]
    }
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


  // Condition structure
  const createCondition = () => ({
    id: Date.now() + Math.random(),
    firstValue: 'close',
    operator: '>',
    secondValue: 'close',
    exitType: 'stop_loss'
  });

  // Estructura de una regla
  const createRule = () => ({
    id: Date.now() + Math.random(),
    conditions: [createCondition()],
    logicalOperators: [] // AND/OR entre condiciones
  });

  const addRule = (ruleType) => {
    console.log('Adding rule:', ruleType);
    const newRule = createRule();
    console.log('New rule created:', newRule);
    setRules(prev => {
      const newRules = {
        ...prev,
        [ruleType]: [...prev[ruleType], newRule]
      };
      console.log('Updated rules:', newRules);
      return newRules;
    });
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

  const updateRuleLogic = (ruleType, ruleId, logicOperator) => {
    setRules(prev => ({
      ...prev,
      [ruleType]: prev[ruleType].map(rule => 
        rule.id === ruleId 
          ? { ...rule, logicOperator }
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

  // Hierarchical dropdown component
  const HierarchicalSelect = ({ value, onChange, placeholder = "Select..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    
    const selectedOption = hierarchicalOptions
      .flatMap(cat => cat.options)
      .find(opt => opt.value === value);
    
    const handleCategorySelect = (category) => {
      setSelectedCategory(category);
    };
    
    const handleOptionSelect = (optionValue) => {
      onChange(optionValue);
      setIsOpen(false);
      setSelectedCategory(null);
    };
    
    const handleCustomValue = () => {
      onChange('custom');
      setIsOpen(false);
      setSelectedCategory(null);
    };

    return (
      <div className="hierarchical-select">
        <div 
          className="hierarchical-select-trigger"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <span className="dropdown-arrow">▼</span>
        </div>
        
        {isOpen && (
          <div className="hierarchical-dropdown">
            {!selectedCategory ? (
              <div className="category-list">
                {hierarchicalOptions.map((category, index) => (
                  <div 
                    key={index}
                    className="category-item"
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category.category} →
                  </div>
                ))}
                <div 
                  className="category-item custom-value"
                  onClick={handleCustomValue}
                >
                  Custom Number
                </div>
              </div>
            ) : (
              <div className="options-list">
                <div 
                  className="back-button"
                  onClick={() => setSelectedCategory(null)}
                >
                  ← {selectedCategory.category}
                </div>
                {selectedCategory.options.map((option, index) => (
                  <div 
                    key={index}
                    className="option-item"
                    onClick={() => handleOptionSelect(option.value)}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Función para renderizar opciones de exit rules basadas en QuantConnect
  const renderExitOptions = (exitType) => {
    switch (exitType) {
      case 'stop_loss':
        return (
          <optgroup label="STOP LOSS VALUES">
            <option value="stop_0.5">0.5%</option>
            <option value="stop_1">1%</option>
            <option value="stop_1.5">1.5%</option>
            <option value="stop_2">2%</option>
            <option value="stop_2.5">2.5%</option>
            <option value="stop_3">3%</option>
            <option value="stop_5">5%</option>
            <option value="stop_7.5">7.5%</option>
            <option value="stop_10">10%</option>
            <option value="stop_15">15%</option>
            <option value="stop_20">20%</option>
          </optgroup>
        );
      case 'take_profit':
        return (
          <optgroup label="TAKE PROFIT VALUES">
            <option value="profit_1">1%</option>
            <option value="profit_2">2%</option>
            <option value="profit_3">3%</option>
            <option value="profit_5">5%</option>
            <option value="profit_7.5">7.5%</option>
            <option value="profit_10">10%</option>
            <option value="profit_15">15%</option>
            <option value="profit_20">20%</option>
            <option value="profit_25">25%</option>
            <option value="profit_30">30%</option>
            <option value="profit_50">50%</option>
          </optgroup>
        );
      case 'trailing_stop':
        return (
          <optgroup label="TRAILING STOP VALUES">
            <option value="trailing_0.5">0.5%</option>
            <option value="trailing_1">1%</option>
            <option value="trailing_1.5">1.5%</option>
            <option value="trailing_2">2%</option>
            <option value="trailing_2.5">2.5%</option>
            <option value="trailing_3">3%</option>
            <option value="trailing_5">5%</option>
            <option value="trailing_7.5">7.5%</option>
            <option value="trailing_10">10%</option>
          </optgroup>
        );
      case 'atr_based':
        return (
          <>
            <optgroup label="ATR STOP LOSS">
              <option value="atr_stop_0.5">0.5x ATR</option>
              <option value="atr_stop_1">1x ATR</option>
              <option value="atr_stop_1.5">1.5x ATR</option>
              <option value="atr_stop_2">2x ATR</option>
              <option value="atr_stop_2.5">2.5x ATR</option>
              <option value="atr_stop_3">3x ATR</option>
              <option value="atr_stop_4">4x ATR</option>
            </optgroup>
            <optgroup label="ATR TAKE PROFIT">
              <option value="atr_profit_1">1x ATR</option>
              <option value="atr_profit_1.5">1.5x ATR</option>
              <option value="atr_profit_2">2x ATR</option>
              <option value="atr_profit_2.5">2.5x ATR</option>
              <option value="atr_profit_3">3x ATR</option>
              <option value="atr_profit_4">4x ATR</option>
              <option value="atr_profit_5">5x ATR</option>
            </optgroup>
            <optgroup label="ATR TRAILING STOP">
              <option value="atr_trailing_1">1x ATR</option>
              <option value="atr_trailing_1.5">1.5x ATR</option>
              <option value="atr_trailing_2">2x ATR</option>
              <option value="atr_trailing_2.5">2.5x ATR</option>
              <option value="atr_trailing_3">3x ATR</option>
            </optgroup>
          </>
        );
      case 'time_based':
        return (
          <optgroup label="TIME-BASED EXIT">
            <option value="time_5_bars">5 Bars</option>
            <option value="time_10_bars">10 Bars</option>
            <option value="time_20_bars">20 Bars</option>
            <option value="time_50_bars">50 Bars</option>
            <option value="time_100_bars">100 Bars</option>
            <option value="time_1_day">1 Day</option>
            <option value="time_2_days">2 Days</option>
            <option value="time_5_days">5 Days</option>
            <option value="time_10_days">10 Days</option>
            <option value="time_1_week">1 Week</option>
            <option value="time_2_weeks">2 Weeks</option>
            <option value="time_1_month">1 Month</option>
          </optgroup>
        );
      case 'indicator_based':
        return (
          <optgroup label="INDICATOR-BASED EXIT">
            <option value="rsi_overbought">RSI Overbought (&gt;70)</option>
            <option value="rsi_oversold">RSI Oversold (&lt;30)</option>
            <option value="macd_cross">MACD Cross</option>
            <option value="bb_upper">Bollinger Upper Band</option>
            <option value="bb_lower">Bollinger Lower Band</option>
            <option value="stoch_overbought">Stochastic Overbought (&gt;80)</option>
            <option value="stoch_oversold">Stochastic Oversold (&lt;20)</option>
            <option value="williams_overbought">Williams %R Overbought (&gt;-20)</option>
            <option value="williams_oversold">Williams %R Oversold (&lt;-80)</option>
            <option value="cci_overbought">CCI Overbought (&gt;100)</option>
            <option value="cci_oversold">CCI Oversold (&lt;-100)</option>
          </optgroup>
        );
      case 'break_even':
        return (
          <optgroup label="BREAK EVEN TRIGGERS">
            <option value="be_1_percent">At 1% Profit</option>
            <option value="be_2_percent">At 2% Profit</option>
            <option value="be_3_percent">At 3% Profit</option>
            <option value="be_5_percent">At 5% Profit</option>
            <option value="be_1_atr">At 1x ATR Profit</option>
            <option value="be_1.5_atr">At 1.5x ATR Profit</option>
            <option value="be_2_atr">At 2x ATR Profit</option>
          </optgroup>
        );
      default:
        return (
          <optgroup label="STOP LOSS">
            <option value="stop_1">1%</option>
            <option value="stop_2">2%</option>
            <option value="stop_3">3%</option>
            <option value="stop_5">5%</option>
          </optgroup>
        );
    }
  };

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
            {ruleType === 'entryRules' && (
              <div className="condition-field">
                <label>First Value</label>
                <select
                  value={condition.firstValue}
                  onChange={(e) => updateCondition(ruleType, ruleId, condition.id, 'firstValue', e.target.value)}
                  className="condition-select"
                >
                  <optgroup label="PRICE">
                    <option value="close">Close Price</option>
                    <option value="open">Open Price</option>
                    <option value="high">High Price</option>
                    <option value="low">Low Price</option>
                  </optgroup>
                  <optgroup label="TREND INDICATORS">
                    <option value="sma_5">SMA 5</option>
                    <option value="sma_10">SMA 10</option>
                    <option value="sma_20">SMA 20</option>
                    <option value="sma_50">SMA 50</option>
                    <option value="sma_100">SMA 100</option>
                    <option value="sma_200">SMA 200</option>
                    <option value="ema_5">EMA 5</option>
                    <option value="ema_10">EMA 10</option>
                    <option value="ema_12">EMA 12</option>
                    <option value="ema_20">EMA 20</option>
                    <option value="ema_26">EMA 26</option>
                    <option value="ema_50">EMA 50</option>
                    <option value="ema_100">EMA 100</option>
                    <option value="ema_200">EMA 200</option>
                    <option value="macd">MACD</option>
                    <option value="macd_signal">MACD Signal</option>
                    <option value="macd_histogram">MACD Histogram</option>
                    <option value="adx">ADX</option>
                    <option value="adx_plus">ADX +DI</option>
                    <option value="adx_minus">ADX -DI</option>
                    <option value="aroon_up">Aroon Up</option>
                    <option value="aroon_down">Aroon Down</option>
                    <option value="aroon_oscillator">Aroon Oscillator</option>
                  </optgroup>
                  <optgroup label="OSCILLATORS">
                    <option value="rsi_14">RSI 14</option>
                    <option value="rsi_20">RSI 20 (Oversold)</option>
                    <option value="rsi_30">RSI 30 (Oversold)</option>
                    <option value="rsi_50">RSI 50 (Center)</option>
                    <option value="rsi_70">RSI 70 (Overbought)</option>
                    <option value="rsi_80">RSI 80 (Overbought)</option>
                    <option value="stoch_k">Stochastic %K</option>
                    <option value="stoch_d">Stochastic %D</option>
                    <option value="stoch_20">Stochastic 20</option>
                    <option value="stoch_80">Stochastic 80</option>
                    <option value="williams_r_14">Williams %R 14</option>
                    <option value="williams_r_20">Williams %R -20</option>
                    <option value="williams_r_80">Williams %R -80</option>
                    <option value="cci_14">CCI 14</option>
                    <option value="cci_100">CCI -100</option>
                    <option value="cci_100_plus">CCI +100</option>
                    <option value="roc_10">ROC 10</option>
                    <option value="roc_20">ROC 20</option>
                    <option value="momentum_10">Momentum 10</option>
                    <option value="momentum_20">Momentum 20</option>
                  </optgroup>
                  <optgroup label="VOLATILITY">
                    <option value="bb_upper_20">Bollinger Upper 20</option>
                    <option value="bb_middle_20">Bollinger Middle 20</option>
                    <option value="bb_lower_20">Bollinger Lower 20</option>
                    <option value="bb_width">Bollinger Width</option>
                    <option value="bb_percent">Bollinger %B</option>
                    <option value="atr_14">ATR 14</option>
                    <option value="atr_21">ATR 21</option>
                    <option value="keltner_upper">Keltner Upper</option>
                    <option value="keltner_middle">Keltner Middle</option>
                    <option value="keltner_lower">Keltner Lower</option>
                    <option value="donchian_upper">Donchian Upper</option>
                    <option value="donchian_lower">Donchian Lower</option>
                    <option value="donchian_middle">Donchian Middle</option>
                  </optgroup>
                  <optgroup label="VOLUME">
                    <option value="obv">OBV</option>
                    <option value="ad_line">A/D Line</option>
                    <option value="cmf">Chaikin Money Flow</option>
                    <option value="mfi_14">MFI 14</option>
                    <option value="vwap">VWAP</option>
                    <option value="vwap_2sd_upper">VWAP +2SD</option>
                    <option value="vwap_1sd_upper">VWAP +1SD</option>
                    <option value="vwap_1sd_lower">VWAP -1SD</option>
                    <option value="vwap_2sd_lower">VWAP -2SD</option>
                    <option value="ease_of_movement">Ease of Movement</option>
                    <option value="force_index">Force Index</option>
                    <option value="klinger_oscillator">Klinger Oscillator</option>
                  </optgroup>
                </select>
              </div>
            )}

            {ruleType === 'exitRules' ? (
              <>
                <div className="condition-field">
                  <label>Exit Type</label>
                  <select
                    value={condition.exitType || 'stop_loss'}
                    onChange={(e) => updateCondition(ruleType, ruleId, condition.id, 'exitType', e.target.value)}
                    className="condition-select"
                  >
                    <option value="stop_loss">Stop Loss</option>
                    <option value="take_profit">Take Profit</option>
                    <option value="trailing_stop">Trailing Stop</option>
                    <option value="atr_based">ATR Based</option>
                    <option value="time_based">Time Based</option>
                    <option value="indicator_based">Indicator Based</option>
                    <option value="break_even">Break Even</option>
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
                  <label>Exit Value</label>
                  <select
                    value={condition.secondValue}
                    onChange={(e) => updateCondition(ruleType, ruleId, condition.id, 'secondValue', e.target.value)}
                    className="condition-select"
                  >
                    {renderExitOptions(condition.exitType || 'stop_loss')}
                  </select>
                </div>
              </>
            ) : (
              <>
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
                  value={condition.secondValue}
                  onChange={(e) => updateCondition(ruleType, ruleId, condition.id, 'secondValue', e.target.value)}
                  className="condition-select"
                >
                  <optgroup label="PRICE">
                    <option value="close">Close Price</option>
                    <option value="open">Open Price</option>
                    <option value="high">High Price</option>
                    <option value="low">Low Price</option>
                  </optgroup>
                  <optgroup label="TREND INDICATORS">
                    <option value="sma_5">SMA 5</option>
                    <option value="sma_10">SMA 10</option>
                    <option value="sma_20">SMA 20</option>
                    <option value="sma_50">SMA 50</option>
                    <option value="sma_100">SMA 100</option>
                    <option value="sma_200">SMA 200</option>
                    <option value="ema_5">EMA 5</option>
                    <option value="ema_10">EMA 10</option>
                    <option value="ema_12">EMA 12</option>
                    <option value="ema_20">EMA 20</option>
                    <option value="ema_26">EMA 26</option>
                    <option value="ema_50">EMA 50</option>
                    <option value="ema_100">EMA 100</option>
                    <option value="ema_200">EMA 200</option>
                    <option value="macd">MACD</option>
                    <option value="macd_signal">MACD Signal</option>
                    <option value="macd_histogram">MACD Histogram</option>
                    <option value="adx">ADX</option>
                    <option value="adx_plus">ADX +DI</option>
                    <option value="adx_minus">ADX -DI</option>
                    <option value="aroon_up">Aroon Up</option>
                    <option value="aroon_down">Aroon Down</option>
                    <option value="aroon_oscillator">Aroon Oscillator</option>
                  </optgroup>
                  <optgroup label="OSCILLATORS">
                    <option value="rsi_14">RSI 14</option>
                    <option value="rsi_20">RSI 20 (Oversold)</option>
                    <option value="rsi_30">RSI 30 (Oversold)</option>
                    <option value="rsi_50">RSI 50 (Center)</option>
                    <option value="rsi_70">RSI 70 (Overbought)</option>
                    <option value="rsi_80">RSI 80 (Overbought)</option>
                    <option value="stoch_k">Stochastic %K</option>
                    <option value="stoch_d">Stochastic %D</option>
                    <option value="stoch_20">Stochastic 20</option>
                    <option value="stoch_80">Stochastic 80</option>
                    <option value="williams_r_14">Williams %R 14</option>
                    <option value="williams_r_20">Williams %R -20</option>
                    <option value="williams_r_80">Williams %R -80</option>
                    <option value="cci_14">CCI 14</option>
                    <option value="cci_100">CCI -100</option>
                    <option value="cci_100_plus">CCI +100</option>
                    <option value="roc_10">ROC 10</option>
                    <option value="roc_20">ROC 20</option>
                    <option value="momentum_10">Momentum 10</option>
                    <option value="momentum_20">Momentum 20</option>
                  </optgroup>
                  <optgroup label="VOLATILITY">
                    <option value="bb_upper_20">Bollinger Upper 20</option>
                    <option value="bb_middle_20">Bollinger Middle 20</option>
                    <option value="bb_lower_20">Bollinger Lower 20</option>
                    <option value="bb_width">Bollinger Width</option>
                    <option value="bb_percent">Bollinger %B</option>
                    <option value="atr_14">ATR 14</option>
                    <option value="atr_21">ATR 21</option>
                    <option value="keltner_upper">Keltner Upper</option>
                    <option value="keltner_middle">Keltner Middle</option>
                    <option value="keltner_lower">Keltner Lower</option>
                    <option value="donchian_upper">Donchian Upper</option>
                    <option value="donchian_lower">Donchian Lower</option>
                    <option value="donchian_middle">Donchian Middle</option>
                  </optgroup>
                  <optgroup label="VOLUME">
                    <option value="obv">OBV</option>
                    <option value="ad_line">A/D Line</option>
                    <option value="cmf">Chaikin Money Flow</option>
                    <option value="mfi_14">MFI 14</option>
                    <option value="vwap">VWAP</option>
                    <option value="vwap_2sd_upper">VWAP +2SD</option>
                    <option value="vwap_1sd_upper">VWAP +1SD</option>
                    <option value="vwap_1sd_lower">VWAP -1SD</option>
                    <option value="vwap_2sd_lower">VWAP -2SD</option>
                    <option value="ease_of_movement">Ease of Movement</option>
                    <option value="force_index">Force Index</option>
                    <option value="klinger_oscillator">Klinger Oscillator</option>
                  </optgroup>
                </select>
              </div>
              </>
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
        {rule.conditions.map((condition, conditionIndex) => (
          <div key={condition.id}>
            {renderCondition(condition, ruleType, rule.id, conditionIndex)}
            {conditionIndex < rule.conditions.length - 1 && (
              <div className="condition-connector">
                <select
                  value={rule.logicOperator || 'AND'}
                  onChange={(e) => updateRuleLogic(ruleType, rule.id, e.target.value)}
                  className="logic-operator-select"
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
              </div>
            )}
          </div>
        ))}

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