import React, { useState, useCallback } from 'react';
import { FaArrowLeft, FaSave, FaChevronRight, FaChevronLeft, FaCog, FaShieldAlt, FaShoppingCart, FaMoneyBillWave } from 'react-icons/fa';
import { toast } from 'react-toastify';

import SimpleRuleBuilder from './SimpleRuleBuilder';
import './StrategyCreator.css';

const StrategyCreator = ({ onStrategyCreated, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [strategyData, setStrategyData] = useState({
    name: '',
    description: '',
    symbol: 'ES',
    timeframe: '1m',
    position_size: 1,
    max_positions: 1,
    stop_loss_type: 'percentage',
    stop_loss_value: 0.5,
    take_profit_type: 'percentage',
    take_profit_value: 2.0,
    round_turn_commissions: 4.00,
    slippage: 0.5
  });
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);

  const steps = [
    { id: 1, title: 'Basic Information', icon: <FaCog />, description: 'Strategy name, description, and timeframe' },
    { id: 2, title: 'Risk Management', icon: <FaShieldAlt />, description: 'Position size, stop loss, and take profit' },
    { id: 3, title: 'Entry Rules', icon: <FaShoppingCart />, description: 'When to buy - define your entry conditions' },
    { id: 4, title: 'Exit Rules', icon: <FaMoneyBillWave />, description: 'When to sell - define your exit conditions' }
  ];



  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setStrategyData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleAddRule = useCallback((rule) => {
    setRules(prev => [...prev, { ...rule, order: prev.length + 1 }]);
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



  const canProceedToNext = useCallback(() => {
    switch (currentStep) {
      case 1: // Basic Information
        return strategyData.name.trim() && strategyData.description.trim();
      case 2: // Risk Management
        return strategyData.position_size > 0 && 
               strategyData.stop_loss_value > 0 && 
               strategyData.take_profit_value > 0 &&
               strategyData.round_turn_commissions >= 0 &&
               strategyData.slippage >= 0;
      case 3: // Entry Rules
        return rules.filter(rule => rule.section === 'entry').length > 0;
      case 4: // Exit Rules
        return rules.filter(rule => rule.section === 'exit').length > 0;
      case 5: // Final step - can save if all previous validations pass
        return strategyData.name.trim() && 
               strategyData.description.trim() && 
               strategyData.position_size > 0 && 
               strategyData.stop_loss_value > 0 && 
               strategyData.take_profit_value > 0 &&
               strategyData.round_turn_commissions >= 0 &&
               strategyData.slippage >= 0 &&
               rules.filter(rule => rule.section === 'entry').length > 0 &&
               rules.filter(rule => rule.section === 'exit').length > 0;
      default:
        return false;
    }
  }, [currentStep, strategyData, rules]);

  const canGoBack = useCallback(() => {
    return currentStep > 1;
  }, [currentStep]);

  const nextStep = useCallback(() => {
    if (canProceedToNext()) {
      const nextStepNumber = Math.min(currentStep + 1, 5);
      setCurrentStep(nextStepNumber);
    }
  }, [canProceedToNext, currentStep]);

  const previousStep = useCallback(() => {
    const prevStepNumber = Math.max(currentStep - 1, 1);
    setCurrentStep(prevStepNumber);
  }, [currentStep]);

  const validateStrategy = useCallback(() => {
    if (!strategyData.name.trim()) {
      toast.error('Strategy name is required', {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }
    
    if (!strategyData.description.trim()) {
      toast.error('Strategy description is required', {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }
    
    const entryRules = rules.filter(rule => rule.section === 'entry');
    const exitRules = rules.filter(rule => rule.section === 'exit');
    
    if (entryRules.length === 0) {
      toast.error('At least one entry rule is required', {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }
    
    if (exitRules.length === 0) {
      toast.error('At least one exit rule is required', {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }
    
    return true;
  }, [strategyData, rules]);

  const handleSaveStrategy = useCallback(async () => {
    if (!validateStrategy()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/strategies/', {
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
        toast.success('Strategy created successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
        onStrategyCreated();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create strategy', {
          position: "top-right",
          autoClose: 4000,
        });
      }
    } catch (err) {
      toast.error('Network error creating strategy', {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  }, [strategyData, rules, validateStrategy, onStrategyCreated]);

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <div key={step.id} className={`step ${currentStep >= step.id ? 'active' : ''} ${currentStep === step.id ? 'current' : ''}`}>
          <div className="step-icon">
            {step.icon}
          </div>
          <div className="step-info">
            <span className="step-number">{step.id}</span>
            <span className="step-title">{step.title}</span>
            <span className="step-description">{step.description}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderBasicInfo = () => (
    <div className="step-content">
      <div className="step-header">
        <h3>Basic Information</h3>
        <p>Start by giving your strategy a name and description</p>
      </div>
      
      <div className="form-content">
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
    </div>
  );



  const renderRiskManagement = () => (
    <div className="step-content">
      <div className="step-header">
        <h3>Risk Management</h3>
        <p>Configure your position sizing and risk controls</p>
      </div>
      
      <div className="form-content">
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
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="round_turn_commissions">Round Turn Commissions ($)</label>
            <input
              type="number"
              id="round_turn_commissions"
              name="round_turn_commissions"
              value={strategyData.round_turn_commissions}
              onChange={handleInputChange}
              step="0.1"
              min="0"
              placeholder="4.00"
            />
            <small>Total commission cost per round turn (entry + exit)</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="slippage">Slippage (Ticks)</label>
            <input
              type="number"
              id="slippage"
              name="slippage"
              value={strategyData.slippage}
              onChange={handleInputChange}
              step="0.1"
              min="0"
              placeholder="0.5"
            />
            <small>Expected slippage per trade in ticks</small>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEntryRules = () => (
    <div className="step-content">
      <div className="step-header">
        <h3>Entry Rules</h3>
        <p>Define when to buy - create conditions that trigger entry signals</p>
      </div>
      
      <div className="rules-content">
        <SimpleRuleBuilder 
          onAddRule={handleAddRule}
          onRemoveRule={handleRemoveRule}
          onMoveRule={handleMoveRule}
          rules={rules.filter(rule => rule.section === 'entry')}
          activeSection="entry"
          readOnly={false}
        />
      </div>
    </div>
  );

  const renderExitRules = () => (
    <div className="step-content">
      <div className="step-header">
        <h3>Exit Rules</h3>
        <p>Define when to sell - create conditions that trigger exit signals</p>
      </div>
      
      <div className="rules-content">
        <SimpleRuleBuilder 
          onAddRule={handleAddRule}
          onRemoveRule={handleRemoveRule}
          onMoveRule={handleMoveRule}
          rules={rules.filter(rule => rule.section === 'exit')}
          activeSection="exit"
          readOnly={false}
        />
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderRiskManagement();
      case 3:
        return renderEntryRules();
      case 4:
        return renderExitRules();
      default:
        return renderBasicInfo();
    }
  };

  return (
    <div className="strategy-creator">
      <div className="strategy-creator-header">
        <h2>🚀 Create New Strategy</h2>
        <p>Build your automated trading strategy step by step</p>
      </div>



      {renderStepIndicator()}

      <div className="strategy-form">
        {renderCurrentStep()}
      </div>

      <div className="strategy-form-actions">
        <button 
          onClick={onBack}
          className="btn btn-secondary"
          disabled={loading}
        >
          <FaArrowLeft /> Back to Strategies
        </button>
        
        <div className="step-navigation">
          {canGoBack() && (
            <button
              onClick={previousStep}
              className="btn btn-secondary"
              disabled={loading}
            >
              <FaChevronLeft /> Previous
            </button>
          )}
          
          {currentStep < 5 ? (
            <button
              onClick={nextStep}
              className="btn btn-primary"
              disabled={!canProceedToNext() || loading}
            >
              Next <FaChevronRight />
            </button>
          ) : (
            <button
              onClick={handleSaveStrategy}
              className="btn btn-primary"
              disabled={loading || !canProceedToNext()}
            >
              {loading ? 'Saving...' : <><FaSave /> Save Strategy</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrategyCreator;
