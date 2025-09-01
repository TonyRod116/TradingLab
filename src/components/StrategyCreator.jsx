import React, { useState, useCallback } from 'react';
import { FaArrowLeft, FaSave, FaChevronDown, FaChevronUp, FaCog, FaChartLine, FaShieldAlt } from 'react-icons/fa';
import RuleBuilder from './RuleBuilder';
import './StrategyCreator.css';

const StrategyCreator = ({ onStrategyCreated, onBack }) => {
  const [strategyData, setStrategyData] = useState({
    name: '',
    description: '',
    symbol: 'ES',
    timeframe: '1m',
    position_size: 1,
    max_positions: 1,
    stop_loss_type: 'ticks',
    stop_loss_value: 20,
    take_profit_type: 'ticks',
    take_profit_value: 40
  });
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [collapsedSections, setCollapsedSections] = useState({
    basic: false,
    risk: false,
    rules: false
  });

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setStrategyData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleAddRule = useCallback((rule) => {
    setRules(prev => [...prev, { ...rule, id: Date.now(), order: prev.length + 1 }]);
  }, []);

  const handleRemoveRule = useCallback((ruleId) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
  }, []);

  const handleMoveRule = useCallback((ruleId, direction) => {
    setRules(prev => {
      const newRules = [...prev];
      const currentIndex = newRules.findIndex(rule => rule.id === ruleId);
      
      if (direction === 'up' && currentIndex > 0) {
        [newRules[currentIndex], newRules[currentIndex - 1]] = [newRules[currentIndex - 1], newRules[currentIndex]];
      } else if (direction === 'down' && currentIndex < newRules.length - 1) {
        [newRules[currentIndex], newRules[currentIndex + 1]] = [newRules[currentIndex + 1], newRules[currentIndex]];
      }
      
      return newRules.map((rule, index) => ({ ...rule, order: index + 1 }));
    });
  }, []);

  const toggleSection = useCallback((section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const validateStrategy = useCallback(() => {
    if (!strategyData.name.trim()) {
      setError('Strategy name is required');
      return false;
    }
    
    if (!strategyData.description.trim()) {
      setError('Strategy description is required');
      return false;
    }
    
    if (rules.length === 0) {
      setError('At least one action rule is required');
      return false;
    }
    
    return true;
  }, [strategyData, rules]);

  const handleSaveStrategy = useCallback(async () => {
    if (!validateStrategy()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/api/strategies/strategies/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...strategyData,
          rules: rules.map(rule => ({
            name: rule.name,
            rule_type: rule.rule_type,
            condition_type: rule.condition_type,
            action_type: rule.action_type,
            left_operand: rule.left_operand,
            operator: rule.operator,
            right_operand: rule.right_operand,
            logical_operator: rule.logical_operator,
            priority: rule.priority,
            order: rule.order,
            is_active: true
          }))
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Strategy created:', result);
        onStrategyCreated();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create strategy');
      }
    } catch (err) {
      setError('Network error creating strategy');
    } finally {
      setLoading(false);
    }
  }, [strategyData, rules, validateStrategy, onStrategyCreated]);

  const renderSectionHeader = (section, title, icon) => (
    <div className="section-header" onClick={() => toggleSection(section)}>
      <div className="section-title">
        {icon}
        <h3>{title}</h3>
      </div>
      <button className="section-toggle">
        {collapsedSections[section] ? <FaChevronDown /> : <FaChevronUp />}
      </button>
    </div>
  );

  const renderBasicInfo = () => (
    <div className="strategy-form-section">
      {renderSectionHeader('basic', 'Basic Information', <FaCog />)}
      
      {!collapsedSections.basic && (
        <div className="section-content">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Strategy Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={strategyData.name}
                onChange={handleInputChange}
                placeholder="e.g., Moving Average Crossover"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="timeframe">Timeframe</label>
              <select
                id="timeframe"
                name="timeframe"
                value={strategyData.timeframe}
                onChange={handleInputChange}
              >
                <option value="1m">1 Minute</option>
                <option value="5m">5 Minutes</option>
                <option value="15m">15 Minutes</option>
                <option value="1h">1 Hour</option>
                <option value="4h">4 Hours</option>
                <option value="1d">1 Day</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={strategyData.description}
              onChange={handleInputChange}
              placeholder="Describe your strategy..."
              rows="3"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="symbol">Instrument</label>
            <div className="instrument-info">
              <span className="instrument-symbol">ES</span>
              <span className="instrument-name">E-mini S&P 500 Futures</span>
              <span className="instrument-details">5 years of data • 0.25 points per tick</span>
            </div>
            <input type="hidden" name="symbol" value="ES" />
          </div>
        </div>
      )}
    </div>
  );

  const renderRiskManagement = () => (
    <div className="strategy-form-section">
      {renderSectionHeader('risk', 'Risk Management', <FaShieldAlt />)}
      
      {!collapsedSections.risk && (
        <div className="section-content">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="position_size">Position Size (Contracts)</label>
              <input
                type="number"
                id="position_size"
                name="position_size"
                value={strategyData.position_size}
                onChange={handleInputChange}
                step="1"
                min="1"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="max_positions">Max Positions</label>
              <input
                type="number"
                id="max_positions"
                name="max_positions"
                value={strategyData.max_positions}
                onChange={handleInputChange}
                min="1"
                max="10"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="stop_loss_type">Stop Loss</label>
              <div className="stop-loss-config">
                <select
                  id="stop_loss_type"
                  name="stop_loss_type"
                  value={strategyData.stop_loss_type}
                  onChange={handleInputChange}
                >
                  <option value="ticks">Ticks (0.25 points)</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="atr">ATR (Average True Range)</option>
                </select>
                <input
                  type="number"
                  id="stop_loss_value"
                  name="stop_loss_value"
                  value={strategyData.stop_loss_value}
                  onChange={handleInputChange}
                  placeholder="Value"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="take_profit_type">Take Profit</label>
              <div className="take-profit-config">
                <select
                  id="take_profit_type"
                  name="take_profit_type"
                  value={strategyData.take_profit_type}
                  onChange={handleInputChange}
                >
                  <option value="ticks">Ticks (0.25 points)</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="atr">ATR (Average True Range)</option>
                </select>
                <input
                  type="number"
                  id="take_profit_value"
                  name="take_profit_value"
                  value={strategyData.take_profit_value}
                  onChange={handleInputChange}
                  placeholder="Value"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderRulesSection = () => (
    <div className="strategy-form-section">
      {renderSectionHeader('rules', 'Strategy Rules', <FaChartLine />)}
      
      {!collapsedSections.rules && (
        <div className="section-content">
          <RuleBuilder 
            onAddRule={handleAddRule}
            onRemoveRule={handleRemoveRule}
            onMoveRule={handleMoveRule}
            rules={rules}
          />
          
          {rules.length > 0 && (
            <div className="rules-preview">
              <h4>Rules Preview</h4>
              <div className="rules-list">
                {rules.map((rule, index) => (
                  <div key={rule.id} className="rule-item">
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
                    <div className="rule-actions">
                      <button
                        onClick={() => handleMoveRule(rule.id, 'up')}
                        disabled={index === 0}
                        className="btn btn-sm btn-secondary"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleMoveRule(rule.id, 'down')}
                        disabled={index === rules.length - 1}
                        className="btn btn-sm btn-secondary"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => handleRemoveRule(rule.id)}
                        className="btn btn-sm btn-danger"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="strategy-creator">
      <div className="strategy-creator-header">
        <h2>🚀 Create New Strategy</h2>
        <p>Build your automated trading strategy using pre-calculated technical indicators from your Parquet backend</p>
        <div className="backend-info">
          <span className="backend-badge">📊 Parquet Backend</span>
          <span className="backend-badge">⚡ Pre-calculated Indicators</span>
          <span className="backend-badge">🚀 Fast Backtesting</span>
        </div>
      </div>

      {error && (
        <div className="strategy-creator-error">
          {error}
        </div>
      )}

      <div className="strategy-form">
        {renderBasicInfo()}
        {renderRiskManagement()}
        {renderRulesSection()}
      </div>

      <div className="strategy-form-actions">
        <button 
          onClick={onBack}
          className="btn btn-secondary"
          disabled={loading}
        >
          <FaArrowLeft /> Back
        </button>
        
        <button
          onClick={handleSaveStrategy}
          className="btn btn-primary"
          disabled={loading || !strategyData.name || !strategyData.description || rules.length === 0}
        >
          {loading ? 'Saving...' : <><FaSave /> Save Strategy</>}
        </button>
      </div>
    </div>
  );
};

export default StrategyCreator;
