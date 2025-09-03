import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaChevronRight, FaChevronLeft, FaCog, FaShieldAlt, FaShoppingCart, FaMoneyBillWave, FaSpinner, FaRocket } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

import SimpleRuleBuilder from './SimpleRuleBuilder';
import BacktestResults from './BacktestResults';
import strategyService from '../services/StrategyService';
import './StrategyCreator.css';

const StrategyCreator = ({ onStrategyCreated, onBack, template }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [strategyData, setStrategyData] = useState({
    name: '',
    description: '',
    symbol: 'ES',
    timeframe: '1m',
    initial_capital: 10000,
    position_size: 1,
    max_positions: 1,
    stop_loss_type: 'atr',
    stop_loss_value: 2.0,
    take_profit_type: 'atr',
    take_profit_value: 4.0,
    round_turn_commissions: 4.00,
    slippage: 0.5
  });
  const [rules, setRules] = useState([]);
  

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [backtestResults, setBacktestResults] = useState(null);

  // Load template rules when template is provided
  useEffect(() => {
    if (template) {
      // Set strategy name and description from template
      setStrategyData(prev => ({
        ...prev,
        name: template.name,
        description: template.description
      }));

      // Convert template rules to the format expected by SimpleRuleBuilder
      const templateRules = [];
      
      // Add entry rules
      template.entryRules.forEach((rule, index) => {
        templateRules.push({
          id: `entry_${index}`,
          name: `Entry Rule ${index + 1}`,
          section: 'entry',
          type: 'entry',
          action_type: 'buy', // Default to buy for entry rules
          order: index + 1,
          conditions: rule.conditions.map(condition => ({
            left_operand: condition.left_operand,
            operator: condition.operator,
            right_operand: condition.right_operand,
            logical_operator: condition.logical_operator || 'and'
          }))
        });
      });

      // Add exit rules
      template.exitRules.forEach((rule, index) => {
        templateRules.push({
          id: `exit_${index}`,
          name: `Exit Rule ${index + 1}`,
          section: 'exit',
          type: 'exit',
          action_type: 'close', // Exit rules always close position
          order: index + 1,
          conditions: rule.conditions.map(condition => ({
            left_operand: condition.left_operand,
            operator: condition.operator,
            right_operand: condition.right_operand,
            logical_operator: condition.logical_operator || 'and'
          }))
        });
      });

      setRules(templateRules);
    }
  }, [template]);

  const steps = [
    { id: 1, title: 'Basic Information', icon: <FaCog />, description: 'Strategy name, description, and timeframe' },
    { id: 2, title: 'Risk Management', icon: <FaShieldAlt />, description: 'Position size, stop loss, and take profit' },
    { id: 3, title: 'Entry Rules', icon: <FaShoppingCart />, description: 'When to buy - define your entry conditions' },
    { id: 4, title: 'Exit Rules', icon: <FaMoneyBillWave />, description: 'When to sell - define your exit conditions' },
    { id: 5, title: 'Backtest', icon: <FaRocket />, description: 'Review strategy and run backtest' }
  ];



  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setStrategyData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Helper function to get conversion info
  const getConversionInfo = (type, value) => {
    if (type === 'ticks' && value) {
      const points = (parseFloat(value) * 0.25).toFixed(2);
      return `${value} ticks = ${points} points`;
    }
    return null;
  };

  // Helper function to get placeholder based on type
  const getPlaceholder = (type) => {
    switch(type) {
      case 'percentage': return '0.5';
      case 'points': return '2.0';
      case 'ticks': return '8';
      case 'atr': return '2.0';
      default: return '';
    }
  };

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
        return strategyData.initial_capital > 0 &&
               strategyData.position_size > 0 && 
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
               strategyData.initial_capital > 0 &&
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

  const formatEntryRules = useCallback((rules) => {
    const entryRules = rules.filter(rule => rule.section === 'entry');
    const formatted = {};
    
    entryRules.forEach(rule => {
      if (rule.conditions && rule.conditions.length > 0) {
        rule.conditions.forEach(condition => {
          // RSI oversold condition
          if (condition.left_operand === 'rsi' && condition.operator === 'lt' && condition.right_operand === 'rsi_30') {
            formatted.rsi_oversold = 30;
          }
          // Price above moving average (EMA crossover)
          if (condition.left_operand === 'ema_20' && condition.operator === 'cross_up' && condition.right_operand === 'ema_50') {
            formatted.price_above_ma = 20;
          }
          // Close above SMA
          if (condition.left_operand === 'close' && condition.operator === 'gt' && condition.right_operand === 'sma_20') {
            formatted.price_above_ma = 20;
          }
          // Close above VWAP
          if (condition.left_operand === 'close' && condition.operator === 'gt' && condition.right_operand === 'vwap') {
            formatted.price_above_ma = 20;
          }
        });
      }
    });
    
    return formatted;
  }, []);

  const formatExitRules = useCallback((rules) => {
    const exitRules = rules.filter(rule => rule.section === 'exit');
    const formatted = {};
    
    exitRules.forEach(rule => {
      if (rule.conditions && rule.conditions.length > 0) {
        rule.conditions.forEach(condition => {
          // RSI overbought condition
          if (condition.left_operand === 'rsi' && condition.operator === 'gt' && condition.right_operand === 'rsi_70') {
            formatted.rsi_overbought = 70;
          }
          // EMA death cross
          if (condition.left_operand === 'ema_20' && condition.operator === 'cross_down' && condition.right_operand === 'ema_50') {
            formatted.time_based = true;
          }
          // Close below VWAP
          if (condition.left_operand === 'close' && condition.operator === 'lt' && condition.right_operand === 'vwap') {
            formatted.time_based = true;
          }
        });
      }
    });
    
    // If no specific exit rules found, add time-based exit
    if (Object.keys(formatted).length === 0) {
      formatted.time_based = true;
    }
    
    return formatted;
  }, []);

  const handleRunBacktest = useCallback(async () => {
    console.log('Starting backtest...');
    console.log('Strategy data:', strategyData);
    console.log('Rules:', rules);
    
    if (!validateStrategy()) {
      console.log('Strategy validation failed');
      return;
    }
    
    console.log('Strategy validation passed, starting backtest...');
    setLoading(true);
    setLoadingMessage('Running backtest... This may take up to 5 minutes for complex strategies.');
    
    try {
      // Create temporary strategy for backtest only
      const entryRules = formatEntryRules(rules);
      const exitRules = formatExitRules(rules);
      
      // Fallback: If no rules are formatted, use default rules
      if (Object.keys(entryRules).length === 0) {
        entryRules.rsi_oversold = 30;
      }
      if (Object.keys(exitRules).length === 0) {
        exitRules.time_based = true;
      }
      
      console.log('Formatted entry rules:', entryRules);
      console.log('Formatted exit rules:', exitRules);
      
      // Add timestamp to name to avoid duplicates
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const tempName = `temp_backtest_${Date.now()}_${timestamp}`;
      
      // Backend supports: percentage, points, pips, atr
      // No conversion needed - send the original types
      const strategyPayload = {
        name: tempName,
        description: strategyData.description,
        symbol: strategyData.symbol,
        timeframe: strategyData.timeframe,
        initial_capital: strategyData.initial_capital,
        entry_rules: entryRules,
        exit_rules: exitRules,
        stop_loss_type: strategyData.stop_loss_type,
        stop_loss_value: strategyData.stop_loss_value,
        take_profit_type: strategyData.take_profit_type,
        take_profit_value: strategyData.take_profit_value
      };

      console.log('Creating temporary strategy...');
      console.log('Strategy payload being sent:', JSON.stringify(strategyPayload, null, 2));
      const strategy = await strategyService.createStrategy(strategyPayload);
      console.log('Strategy created:', strategy);
      
      // Show success toast when strategy is created and backtest starts
      toast.success('Strategy created successfully! Starting backtest calculation...', {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Run backtest using service
      const backtestParams = {
        start_date: '2020-01-01T00:00:00Z',
        end_date: '2024-12-31T23:59:59Z',
        initial_capital: 100000,
        commission: strategyData.round_turn_commissions,
        slippage: strategyData.slippage
      };

      console.log('Running backtest with params:', backtestParams);
      console.log('Strategy ID for backtest:', strategy.id);
      const backtestResults = await strategyService.runBacktest(strategy.id, backtestParams);
      console.log('Backtest results:', backtestResults);
      
      // Add strategy_id to results so we can update it later
      const resultsWithStrategyId = {
        ...backtestResults,
        strategy_id: strategy.id
      };
      
      setBacktestResults(resultsWithStrategyId);
      
      if (backtestResults.trades && backtestResults.trades.length > 0) {
        toast.success(`Backtest completed! Generated ${backtestResults.trades.length} trades.`);
      } else {
        toast.warning('Backtest completed but no trades were executed. Check your strategy rules.');
      }
      
    } catch (error) {
      console.error('Backtest error:', error);
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        toast.warning('Backtest is taking longer than expected. It may still be running in the background. Please check your strategies list in a few minutes.');
      } else {
        toast.error(`Error running backtest: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  }, [strategyData, rules, validateStrategy, formatEntryRules, formatExitRules]);

  const handleCloseBacktestResults = useCallback(() => {
    setBacktestResults(null);
  }, []);

  const handleSaveResults = useCallback(async () => {
    if (!backtestResults) return;
    
    try {
      // The strategy is already saved from the backtest, we just need to update its name
      // to make it permanent (remove the "temp_backtest_" prefix)
      // Add timestamp to avoid name conflicts
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const finalName = `${strategyData.name}_${timestamp}`;
      
      console.log('Updating strategy name from temp to final:', finalName);
      console.log('Strategy ID:', backtestResults.strategy_id);
      
      // Format rules for the update
      const entryRules = formatEntryRules(rules);
      const exitRules = formatExitRules(rules);
      
      // Fallback: If no rules are formatted, use default rules
      if (Object.keys(entryRules).length === 0) {
        entryRules.rsi_oversold = 30;
      }
      if (Object.keys(exitRules).length === 0) {
        exitRules.time_based = true;
      }
      
      // Backend supports: percentage, points, pips, atr
      // No conversion needed - send the original types
      
      // Extract all detailed backtest data
      const performance = backtestResults.performance || {};
      const trades = backtestResults.trades || [];
      
      // Calculate additional metrics from trades
      const winningTrades = trades.filter(trade => trade.pnl > 0);
      const losingTrades = trades.filter(trade => trade.pnl < 0);
      const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, trade) => sum + trade.pnl, 0) / winningTrades.length : 0;
      const avgLoss = losingTrades.length > 0 ? losingTrades.reduce((sum, trade) => sum + trade.pnl, 0) / losingTrades.length : 0;
      const largestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(trade => trade.pnl)) : 0;
      const largestLoss = losingTrades.length > 0 ? Math.min(...losingTrades.map(trade => trade.pnl)) : 0;
      
      const completeStrategyData = {
        name: finalName,
        description: strategyData.description,
        symbol: strategyData.symbol,
        timeframe: strategyData.timeframe,
        initial_capital: strategyData.initial_capital,
        entry_rules: entryRules,
        exit_rules: exitRules,
        stop_loss_type: strategyData.stop_loss_type,
        stop_loss_value: strategyData.stop_loss_value,
        take_profit_type: strategyData.take_profit_type,
        take_profit_value: strategyData.take_profit_value,
        // Detailed backtest metrics
        total_return: performance.total_return || 0,
        total_return_percent: performance.total_return_percent || 0,
        total_trades: performance.total_trades || trades.length,
        winning_trades: performance.winning_trades || winningTrades.length,
        losing_trades: performance.losing_trades || losingTrades.length,
        win_rate: performance.win_rate || (trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0),
        profit_factor: performance.profit_factor || 0,
        sharpe_ratio: performance.sharpe_ratio || 0,
        max_drawdown: performance.max_drawdown || 0,
        max_drawdown_percent: performance.max_drawdown_percent || 0,
        avg_win: avgWin,
        avg_loss: avgLoss,
        largest_win: largestWin,
        largest_loss: largestLoss,
        initial_capital: backtestResults.initial_capital || 100000,
        final_capital: backtestResults.final_capital || (backtestResults.initial_capital + (performance.total_return || 0)),
        // Additional metrics
        sortino_ratio: performance.sortino_ratio || 0,
        calmar_ratio: performance.calmar_ratio || 0,
        volatility: performance.volatility || 0,
        max_consecutive_wins: performance.max_consecutive_wins || 0,
        max_consecutive_losses: performance.max_consecutive_losses || 0,
        avg_trade_duration: performance.avg_trade_duration || 0,
        // Backtest metadata
        backtest_start_date: backtestResults.start_date,
        backtest_end_date: backtestResults.end_date,
        backtest_commission: backtestResults.commission || strategyData.round_turn_commissions,
        backtest_slippage: backtestResults.slippage || strategyData.slippage
      };
      
      console.log('Updating strategy with complete data:', completeStrategyData);
      console.log('Detailed metrics being saved:');
      console.log('- Total trades:', completeStrategyData.total_trades);
      console.log('- Winning trades:', completeStrategyData.winning_trades);
      console.log('- Losing trades:', completeStrategyData.losing_trades);
      console.log('- Win rate:', completeStrategyData.win_rate);
      console.log('- Average win:', completeStrategyData.avg_win);
      console.log('- Average loss:', completeStrategyData.avg_loss);
      console.log('- Largest win:', completeStrategyData.largest_win);
      console.log('- Largest loss:', completeStrategyData.largest_loss);
      console.log('- Sharpe ratio:', completeStrategyData.sharpe_ratio);
      console.log('- Max drawdown:', completeStrategyData.max_drawdown);
      
      // Use strategyService which uses PUT method
      try {
        const updatedStrategy = await strategyService.updateStrategy(backtestResults.strategy_id, completeStrategyData);
        console.log('Strategy updated successfully:', updatedStrategy);
      } catch (updateError) {
        console.error('StrategyService update failed:', updateError);
        
        // Try alternative approach: create a new strategy with the final name
        console.log('Trying alternative approach: creating new strategy with final name...');
        
        const newStrategy = await strategyService.createStrategy(completeStrategyData);
        console.log('New strategy created:', newStrategy);
        
        // Run backtest for the new strategy
        const backtestParams = {
          start_date: '2020-01-01T00:00:00Z',
          end_date: '2024-12-31T23:59:59Z',
          initial_capital: 100000,
          commission: strategyData.round_turn_commissions,
          slippage: strategyData.slippage
        };
        
        console.log('Running backtest for new strategy...');
        const finalBacktestResults = await strategyService.runBacktest(newStrategy.id, backtestParams);
        console.log('Final backtest completed:', finalBacktestResults);
        
        // Delete the temporary strategy
        try {
          await strategyService.deleteStrategy(backtestResults.strategy_id);
          console.log('Temporary strategy deleted successfully');
        } catch (deleteError) {
          console.warn('Could not delete temporary strategy:', deleteError);
        }
      }
      
      toast.success('Strategy saved successfully! Redirecting to your profile...');
      
      // Navigate to user profile after a short delay
      setTimeout(() => {
        const userId = user?.id;
        console.log('Navigating to profile, userId:', userId);
        if (userId) {
          navigate(`/users/profile/${userId}`);
        } else {
          console.error('No user_id found in auth context');
          navigate('/strategies');
        }
      }, 1500);
      
    } catch (error) {
      console.error('Error saving strategy:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      // More detailed error message
      let errorMessage = 'Error saving strategy';
      if (error.response?.data?.detail) {
        errorMessage += `: ${error.response.data.detail}`;
      } else if (error.response?.data?.message) {
        errorMessage += `: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      toast.error(`Failed to save strategy: ${errorMessage}`);
    }
  }, [backtestResults, strategyData, rules, formatEntryRules, formatExitRules, navigate]);

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
              <option value="30m">30 Minutes</option>
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
            <label htmlFor="initial_capital">Initial Capital ($)</label>
            <input
              type="number"
              id="initial_capital"
              name="initial_capital"
              value={strategyData.initial_capital}
              onChange={handleInputChange}
              step="100"
              min="1000"
              placeholder="10000"
            />
          </div>
        </div>
        
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
                <option value="percentage">Percentage (%)</option>
                <option value="points">Points</option>
                <option value="ticks">Ticks (0.25 pts each)</option>
                <option value="atr">ATR Multiplier</option>
              </select>
              <input
                type="number"
                id="stop_loss_value"
                name="stop_loss_value"
                value={strategyData.stop_loss_value}
                onChange={handleInputChange}
                placeholder={getPlaceholder(strategyData.stop_loss_type)}
                min="0"
                step="0.01"
              />
              {getConversionInfo(strategyData.stop_loss_type, strategyData.stop_loss_value) && (
                <small className="conversion-info">
                  {getConversionInfo(strategyData.stop_loss_type, strategyData.stop_loss_value)}
                </small>
              )}
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
                <option value="percentage">Percentage (%)</option>
                <option value="points">Points</option>
                <option value="ticks">Ticks (0.25 pts each)</option>
                <option value="atr">ATR Multiplier</option>
              </select>
              <input
                type="number"
                id="take_profit_value"
                name="take_profit_value"
                value={strategyData.take_profit_value}
                onChange={handleInputChange}
                placeholder={getPlaceholder(strategyData.take_profit_type)}
                min="0"
                step="0.01"
              />
              {getConversionInfo(strategyData.take_profit_type, strategyData.take_profit_value) && (
                <small className="conversion-info">
                  {getConversionInfo(strategyData.take_profit_type, strategyData.take_profit_value)}
                </small>
              )}
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

  // Helper function to convert operators to readable symbols
  const formatOperator = (operator) => {
    const operatorMap = {
      'gt': '>',
      'lt': '<',
      'gte': '≥',
      'lte': '≤',
      'eq': '=',
      'ne': '≠',
      'and': 'AND',
      'or': 'OR'
    };
    return operatorMap[operator] || operator;
  };

  const renderBacktestStep = () => (
    <div className="step-content">
      <div className="step-header">
        <h3>Strategy Summary</h3>
        <p>Review your strategy before running the backtest</p>
      </div>
      
      <div className="strategy-summary">
        <div className="summary-section">
          <h4>Basic Information</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Strategy Name:</span>
              <span className="summary-value">{strategyData.name}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Description:</span>
              <span className="summary-value">{strategyData.description}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Symbol:</span>
              <span className="summary-value">{strategyData.symbol}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Timeframe:</span>
              <span className="summary-value">{strategyData.timeframe}</span>
            </div>
          </div>
        </div>

        <div className="summary-section">
          <h4>Risk Management</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Initial Capital:</span>
              <span className="summary-value">${strategyData.initial_capital.toLocaleString()}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Position Size:</span>
              <span className="summary-value">{strategyData.position_size}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Stop Loss:</span>
              <span className="summary-value">{strategyData.stop_loss_value}%</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Take Profit:</span>
              <span className="summary-value">{strategyData.take_profit_value}%</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Commission:</span>
              <span className="summary-value">${strategyData.round_turn_commissions}</span>
            </div>
          </div>
        </div>

        <div className="summary-section">
          <h4>Entry Rules</h4>
          <div className="rules-summary">
            {rules.filter(rule => rule.section === 'entry').map((rule, index) => (
              <div key={rule.id} className="rule-details">
                <div className="rule-item">
                  <span className="rule-number">{index + 1}.</span>
                  <span className="rule-text">
                    {rule.conditions.map((condition, condIndex) => (
                      <span key={condIndex} className="rule-condition">
                        {condition.left_operand || 'Unknown'} {formatOperator(condition.operator) || ''} {condition.right_operand || 'N/A'}
                        {condIndex < rule.conditions.length - 1 && ` ${formatOperator(condition.logical_operator) || 'AND'} `}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="summary-section">
          <h4>Exit Rules</h4>
          <div className="rules-summary">
            {rules.filter(rule => rule.section === 'exit').map((rule, index) => (
              <div key={rule.id} className="rule-details">
                <div className="rule-item">
                  <span className="rule-number">{index + 1}.</span>
                  <span className="rule-text">
                    {rule.conditions.map((condition, condIndex) => (
                      <span key={condIndex} className="rule-condition">
                        {condition.left_operand || 'Unknown'} {formatOperator(condition.operator) || ''} {condition.right_operand || 'N/A'}
                        {condIndex < rule.conditions.length - 1 && ` ${formatOperator(condition.logical_operator) || 'AND'} `}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
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
      case 5:
        return renderBacktestStep();
      default:
        return renderBasicInfo();
    }
  };

  return (
    <>
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
                onClick={handleRunBacktest}
                className="btn btn-primary"
                disabled={loading || !canProceedToNext()}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spinner" /> {loadingMessage || 'Running Backtest...'}
                  </>
                ) : (
                  <><FaRocket /> Backtest</>
                )}
              </button>
            )}
            
            {loading && (
              <button
                onClick={() => {
                  setLoading(false);
                  setLoadingMessage('');
                  toast.info('Operation cancelled');
                }}
                className="btn btn-warning"
                style={{ marginLeft: '10px' }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {backtestResults && (
        <BacktestResults 
          results={backtestResults} 
          onClose={handleCloseBacktestResults}
          onSave={handleSaveResults}
        />
      )}
    </>
  );
};

export default StrategyCreator;
