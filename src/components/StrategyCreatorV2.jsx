import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaChevronRight, FaChevronLeft, FaRocket, FaCog, FaShieldAlt, FaChartLine } from 'react-icons/fa';
import { toast } from 'react-toastify';
import VisualIndicatorBuilder from './VisualIndicatorBuilder';
import DateRangeSelector from './DateRangeSelector';
import BacktestResults from './BacktestResults';
import strategyService from '../services/StrategyService';
import { useAuth } from '../contexts/AuthContext';
import './StrategyCreatorV2.css';

const StrategyCreatorV2 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [backtestResults, setBacktestResults] = useState(null);

  // Form data
  const [strategyData, setStrategyData] = useState({
    name: '',
    description: '',
    symbol: 'ES',
    timeframe: '5m',
    initial_capital: 100000
  });

  const [entryConditions, setEntryConditions] = useState([]);
  
  const [riskManagement, setRiskManagement] = useState({
    stop_loss_type: 'points',
    stop_loss_value: 2.0,
    take_profit_type: 'points',
    take_profit_value: 4.0
  });

  const [dateRange, setDateRange] = useState({
    start_date: null,
    end_date: null
  });

  const [estimation, setEstimation] = useState(null);

  const steps = [
    { id: 1, title: 'Strategy Info', icon: <FaCog />, description: 'Name, description & timeframe' },
    { id: 2, title: 'Entry Conditions', icon: <FaChartLine />, description: 'Define when to enter trades' },
    { id: 3, title: 'Risk Management', icon: <FaShieldAlt />, description: 'Stop loss & take profit' },
    { id: 4, title: 'Backtest', icon: <FaRocket />, description: 'Select date range & run backtest' }
  ];

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setStrategyData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleRiskChange = useCallback((e) => {
    const { name, value } = e.target;
    setRiskManagement(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleDateRangeChange = useCallback((startDate, endDate) => {
    setDateRange({
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    });
  }, []);

  const handleEstimationChange = useCallback((est) => {
    setEstimation(est);
  }, []);

  const validateStep = useCallback((step) => {
    switch (step) {
      case 1:
        if (!strategyData.name.trim()) {
          toast.error('Strategy name is required');
          return false;
        }
        if (!strategyData.description.trim()) {
          toast.error('Strategy description is required');
          return false;
        }
        return true;
      case 2:
        if (entryConditions.length === 0) {
          toast.error('At least one entry condition is required');
          return false;
        }
        return true;
      case 3:
        if (!riskManagement.stop_loss_value || parseFloat(riskManagement.stop_loss_value) <= 0) {
          toast.error('Valid stop loss value is required');
          return false;
        }
        if (!riskManagement.take_profit_value || parseFloat(riskManagement.take_profit_value) <= 0) {
          toast.error('Valid take profit value is required');
          return false;
        }
        return true;
      case 4:
        if (!dateRange.start_date || !dateRange.end_date) {
          toast.error('Date range is required');
          return false;
        }
        return true;
      default:
        return true;
    }
  }, [strategyData, entryConditions, riskManagement, dateRange]);

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const handleRunBacktest = useCallback(async () => {
    if (!validateStep(4)) {
      return;
    }

    setLoading(true);
    setLoadingMessage(`Running backtest... ${estimation ? `Estimated time: ${estimation.estimatedTime}` : ''}`);

    let tempStrategyId = null;

    try {
      // Format entry rules
      const entry_rules = [{
        name: 'Entry Rule 1',
        rule_type: 'condition',
        action_type: 'buy',
        conditions: entryConditions,
        priority: 1,
        parameters: {}
      }];

      // Exit rules - create a simple time-based exit rule with required fields
      const exit_rules = [{
        name: 'Exit Rule 1',
        rule_type: 'condition',
        action_type: 'close',
        conditions: [{
          left_operand: 'close',
          operator: 'gt',
          right_operand: '0',
          logical_operator: 'and'
        }],
        priority: 1,
        parameters: { time_based: true }
      }];

      // Create temporary strategy
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const tempName = `temp_backtest_v2_${Date.now()}_${timestamp}`;

      const strategyPayload = {
        name: tempName,
        description: strategyData.description,
        symbol: strategyData.symbol,
        timeframe: strategyData.timeframe,
        initial_capital: strategyData.initial_capital,
        entry_rules: entry_rules,
        exit_rules: exit_rules,
        stop_loss_type: riskManagement.stop_loss_type,
        stop_loss_value: parseFloat(riskManagement.stop_loss_value),
        take_profit_type: riskManagement.take_profit_type,
        take_profit_value: parseFloat(riskManagement.take_profit_value),
        status: 'READY'
      };

      const strategy = await strategyService.createStrategy(strategyPayload);
      tempStrategyId = strategy.id;

      toast.success('Starting backtest calculation...');

      // Run backtest with selected date range
      const backtestParams = {
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
        initial_capital: strategyData.initial_capital,
        commission: 4.00,
        slippage: 0.25
      };

      const results = await strategyService.runBacktest(strategy.id, backtestParams);

      const resultsWithStrategy = {
        ...results,
        strategy_id: strategy.id,
        is_temporary: true
      };

      setBacktestResults(resultsWithStrategy);

      if (results.trades && results.trades.length > 0) {
        toast.success(`Backtest completed! Generated ${results.trades.length} trades.`);
      } else {
        toast.warning('Backtest completed but no trades were executed. Try adjusting your conditions.');
      }

    } catch (error) {
      if (tempStrategyId) {
        try {
          await strategyService.deleteStrategy(tempStrategyId);
        } catch (deleteError) {
          console.error('Error deleting temporary strategy:', deleteError);
        }
      }

      toast.error(`Backtest failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  }, [strategyData, entryConditions, riskManagement, dateRange, estimation, validateStep]);

  const handleCloseBacktestResults = useCallback(async () => {
    if (backtestResults && backtestResults.strategy_id && backtestResults.is_temporary) {
      try {
        await strategyService.deleteStrategy(backtestResults.strategy_id);
      } catch (error) {
        console.error('Error deleting temporary strategy:', error);
      }
    }
    setBacktestResults(null);
  }, [backtestResults]);

  const handleSaveStrategy = useCallback(async () => {
    if (!backtestResults || !backtestResults.strategy_id) {
      toast.error('No strategy to save');
      return;
    }

    setLoading(true);
    setLoadingMessage('Saving strategy...');
    console.log('[StrategyCreatorV2] Saving strategy', {
      strategyId: backtestResults?.strategy_id,
      strategyData,
      entryConditions,
      riskManagement
    });

    try {
      // Format entry rules (same format as in handleRunBacktest)
      const entry_rules = [{
        name: 'Entry Rule 1',
        rule_type: 'condition',
        action_type: 'buy',
        conditions: entryConditions,
        priority: 1,
        parameters: {}
      }];

      // Exit rules - same format as in handleRunBacktest
      const exit_rules = [{
        name: 'Exit Rule 1',
        rule_type: 'condition',
        action_type: 'close',
        conditions: [{
          left_operand: 'close',
          operator: 'gt',
          right_operand: '0',
          logical_operator: 'and'
        }],
        priority: 1,
        parameters: { time_based: true }
      }];

      // Update the temporary strategy with the actual name and make it permanent
      const completeStrategyData = {
        name: strategyData.name, // Use the actual name from form
        description: strategyData.description,
        symbol: strategyData.symbol,
        timeframe: strategyData.timeframe,
        initial_capital: strategyData.initial_capital,
        entry_rules: entry_rules,
        exit_rules: exit_rules,
        stop_loss_type: riskManagement.stop_loss_type,
        stop_loss_value: parseFloat(riskManagement.stop_loss_value),
        take_profit_type: riskManagement.take_profit_type,
        take_profit_value: parseFloat(riskManagement.take_profit_value),
        status: 'READY' // Keep it ready for future backtests
      };
      console.log('[StrategyCreatorV2] Payload sent to updateStrategy', completeStrategyData);

      // Update the temporary strategy to make it permanent
      const updatedStrategy = await strategyService.updateStrategy(
        backtestResults.strategy_id,
        completeStrategyData
      );
      console.log('[StrategyCreatorV2] Strategy updated successfully', updatedStrategy);

      toast.success('Strategy saved successfully! Redirecting to your profile...');

      // Navigate to user profile after a short delay
      setTimeout(() => {
        const userId = user?.id;
        if (userId) {
          navigate(`/users/profile/${userId}`);
        } else {
          navigate('/strategies');
        }
      }, 1500);

    } catch (error) {
      // Error saving strategy
      let errorMessage = 'Error saving strategy';
      if (error.response?.data?.detail) {
        errorMessage += `: ${error.response.data.detail}`;
      } else if (error.response?.data?.message) {
        errorMessage += `: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      console.error('[StrategyCreatorV2] Error saving strategy', error);

      toast.error(`Failed to save strategy: ${errorMessage}`, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  }, [backtestResults, strategyData, entryConditions, riskManagement, user, navigate]);

  if (backtestResults) {
    return (
      <div className="strategy-creator-v2">
        <BacktestResults
          results={backtestResults}
          onClose={handleCloseBacktestResults}
          onSaveStrategy={handleSaveStrategy}
        />
      </div>
    );
  }

  return (
    <div className="strategy-creator-v2">
      <div className="creator-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft />
          <span>Back</span>
        </button>
        <h1>Create Strategy V2</h1>
        <div className="header-subtitle">Build and test your trading strategy</div>
      </div>

      <div className="progress-steps">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
          >
            <div className="step-icon">{step.icon}</div>
            <div className="step-content">
              <div className="step-title">{step.title}</div>
              <div className="step-description">{step.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="creator-content">
        {currentStep === 1 && (
          <div className="step-panel">
            <h2>Strategy Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Strategy Name *</label>
                <input
                  type="text"
                  name="name"
                  value={strategyData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., EMA Crossover Strategy"
                  disabled={loading}
                />
              </div>

              <div className="form-group full-width">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={strategyData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your strategy..."
                  rows={3}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Symbol</label>
                <select name="symbol" value={strategyData.symbol} onChange={handleInputChange} disabled>
                  <option value="ES">ES (E-mini S&P 500)</option>
                </select>
                <small>Currently only ES futures data is available</small>
              </div>

              <div className="form-group">
                <label>Timeframe *</label>
                <select name="timeframe" value={strategyData.timeframe} onChange={handleInputChange} disabled={loading}>
                  <option value="5m">5 Minutes</option>
                  <option value="15m">15 Minutes</option>
                  <option value="30m">30 Minutes</option>
                  <option value="1h">1 Hour</option>
                  <option value="4h">4 Hours</option>
                  <option value="1d">1 Day</option>
                </select>
              </div>

              <div className="form-group">
                <label>Initial Capital</label>
                <input
                  type="number"
                  name="initial_capital"
                  value={strategyData.initial_capital}
                  onChange={handleInputChange}
                  min={1000}
                  step={1000}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="step-panel">
            <h2>Entry Conditions</h2>
            <p className="step-instructions">
              Define up to 5 conditions for entering trades. All conditions will be checked before opening a position.
            </p>
            <VisualIndicatorBuilder
              conditions={entryConditions}
              onChange={setEntryConditions}
              maxConditions={5}
            />
          </div>
        )}

        {currentStep === 3 && (
          <div className="step-panel">
            <h2>Risk Management</h2>
            <p className="step-instructions">
              Set your stop loss and take profit levels. These will be applied to all trades.
            </p>
            <div className="form-grid">
              <div className="form-group">
                <label>Stop Loss Type</label>
                <select name="stop_loss_type" value={riskManagement.stop_loss_type} onChange={handleRiskChange}>
                  <option value="points">Points</option>
                  <option value="percentage">Percentage</option>
                  <option value="ticks">Ticks</option>
                </select>
              </div>

              <div className="form-group">
                <label>Stop Loss Value</label>
                <input
                  type="number"
                  name="stop_loss_value"
                  value={riskManagement.stop_loss_value}
                  onChange={handleRiskChange}
                  min={0.25}
                  step={0.25}
                />
                <small>
                  {riskManagement.stop_loss_type === 'points' && 'ES: 1 point = $50'}
                  {riskManagement.stop_loss_type === 'ticks' && 'ES: 1 tick = 0.25 points = $12.50'}
                </small>
              </div>

              <div className="form-group">
                <label>Take Profit Type</label>
                <select name="take_profit_type" value={riskManagement.take_profit_type} onChange={handleRiskChange}>
                  <option value="points">Points</option>
                  <option value="percentage">Percentage</option>
                  <option value="ticks">Ticks</option>
                </select>
              </div>

              <div className="form-group">
                <label>Take Profit Value</label>
                <input
                  type="number"
                  name="take_profit_value"
                  value={riskManagement.take_profit_value}
                  onChange={handleRiskChange}
                  min={0.25}
                  step={0.25}
                />
                <small>
                  {riskManagement.take_profit_type === 'points' && 'ES: 1 point = $50'}
                  {riskManagement.take_profit_type === 'ticks' && 'ES: 1 tick = 0.25 points = $12.50'}
                </small>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="step-panel">
            <h2>Backtest Configuration</h2>
            <p className="step-instructions">
              Select the date range for your backtest. Larger ranges will take longer to process.
            </p>
            <DateRangeSelector
              timeframe={strategyData.timeframe}
              onDateRangeChange={handleDateRangeChange}
              onEstimationChange={handleEstimationChange}
            />

            <div className="backtest-summary">
              <h3>Strategy Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Name:</span>
                  <span className="summary-value">{strategyData.name}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Timeframe:</span>
                  <span className="summary-value">{strategyData.timeframe}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Entry Conditions:</span>
                  <span className="summary-value">{entryConditions.length} condition(s)</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Stop Loss:</span>
                  <span className="summary-value">{riskManagement.stop_loss_value} {riskManagement.stop_loss_type}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Take Profit:</span>
                  <span className="summary-value">{riskManagement.take_profit_value} {riskManagement.take_profit_type}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="creator-actions">
        {currentStep > 1 && (
          <button className="btn btn-secondary" onClick={prevStep} disabled={loading}>
            <FaChevronLeft />
            Previous
          </button>
        )}
        
        <div className="action-spacer" />

        {currentStep < 4 ? (
          <button className="btn btn-primary" onClick={nextStep} disabled={loading}>
            Next
            <FaChevronRight />
          </button>
        ) : (
          <button className="btn btn-success" onClick={handleRunBacktest} disabled={loading || !dateRange.start_date}>
            <FaRocket />
            {loading ? loadingMessage || 'Running Backtest...' : 'Run Backtest'}
          </button>
        )}
      </div>
    </div>
  );
};

export default StrategyCreatorV2;

