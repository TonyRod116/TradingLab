import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaChartLine, 
  FaRocket, 
  FaEdit, 
  FaTrash,
  FaPlay,
  FaPause,
  FaEye,
  FaTrophy,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { cleanStrategyName } from '../utils/strategyUtils';
import strategyService from '../services/StrategyService';
import Header from './Header';
import BacktestCharts from './BacktestCharts';
import './StrategyDetails.css';

const StrategyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [strategy, setStrategy] = useState(null);
  const [backtestResults, setBacktestResults] = useState(null);
  const [backtestId, setBacktestId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStrategyDetails();
  }, [id]);

  const loadStrategyDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const strategyData = await strategyService.getStrategy(id);
      setStrategy(strategyData);
      
      // Try to load backtest results if available
      try {
        const backtestData = await strategyService.getBacktests(id);
        if (backtestData && backtestData.length > 0) {
          const latestBacktest = backtestData[0]; // Get latest backtest
          setBacktestResults(latestBacktest);
          setBacktestId(latestBacktest.id); // Set backtest ID for charts
        }
      } catch (backtestError) {
        // No backtest results available
      }
    } catch (err) {
      console.error('Error loading strategy details:', err);
      setError('Failed to load strategy details');
      toast.error('Failed to load strategy details');
    } finally {
      setLoading(false);
    }
  };

  const handleRunBacktest = async () => {
    try {
      const backtestParams = {
        start_date: '2023-01-01',
        end_date: '2023-12-31',
        initial_capital: strategy.initial_capital || 10000,
        commission: 4.00,
        slippage: 0.5
      };
      
      const results = await strategyService.runBacktest(id, backtestParams);
      setBacktestResults(results);
      setBacktestId(results.id); // Set backtest ID for charts
      toast.success('Backtest completed successfully!');
    } catch (err) {
      toast.error('Failed to run backtest');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this strategy?')) {
      try {
        await strategyService.deleteStrategy(id);
        toast.success('Strategy deleted successfully');
        navigate('/strategies');
      } catch (err) {
        toast.error('Failed to delete strategy');
      }
    }
  };

  const renderProfitLossChart = () => {
    if (!backtestResults || !backtestResults.equity_curve) {
      return (
        <div className="chart-placeholder">
          <FaChartLine className="chart-icon" />
          <p>No backtest data available</p>
          <button onClick={handleRunBacktest} className="btn btn-primary">
            <FaRocket /> Run Backtest
          </button>
        </div>
      );
    }

    // Simple profit/loss chart using CSS
    const equityData = backtestResults.equity_curve;
    const maxEquity = Math.max(...equityData);
    const minEquity = Math.min(...equityData);
    const range = maxEquity - minEquity;

    return (
      <div className="profit-loss-chart">
        <h4>Equity Curve</h4>
        <div className="chart-container">
          <div className="chart-bars">
            {equityData.map((value, index) => {
              const height = range > 0 ? ((value - minEquity) / range) * 100 : 50;
              const isPositive = value >= (backtestResults.initial_capital || 10000);
              
              return (
                <div
                  key={index}
                  className={`chart-bar ${isPositive ? 'positive' : 'negative'}`}
                  style={{ height: `${height}%` }}
                  title={`Day ${index + 1}: $${value.toLocaleString()}`}
                />
              );
            })}
          </div>
          <div className="chart-labels">
            <span>Start</span>
            <span>End</span>
          </div>
        </div>
        <div className="chart-stats">
          <div className="stat">
            <span className="label">Initial:</span>
            <span className="value">${(backtestResults.initial_capital || 10000).toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="label">Final:</span>
            <span className="value">${(backtestResults.final_capital || 0).toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="label">Max:</span>
            <span className="value">${maxEquity.toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="label">Min:</span>
            <span className="value">${minEquity.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderMetrics = () => {
    if (!backtestResults) {
      return (
        <div className="no-metrics">
          <p>No backtest results available</p>
          <button onClick={handleRunBacktest} className="btn btn-primary">
            <FaRocket /> Run Backtest
          </button>
        </div>
      );
    }

    const performance = backtestResults.performance || {};
    const settings = backtestResults.settings || {};

    return (
      <div className="metrics-grid">
        {/* Performance Overview */}
        <div className="metric-section">
          <h4>Performance Overview</h4>
          <div className="metric-cards">
            <div className="metric-card">
              <div className="metric-icon">
                <FaTrophy />
              </div>
              <div className="metric-content">
                <span className="metric-label">Total Return</span>
                <span className={`metric-value ${parseFloat(performance.total_return_percent || 0) >= 0 ? 'positive' : 'negative'}`}>
                  {performance.total_return_percent ? `${parseFloat(performance.total_return_percent).toFixed(2)}%` : 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">
                <FaChartLine />
              </div>
              <div className="metric-content">
                <span className="metric-label">Win Rate</span>
                <span className="metric-value">
                  {performance.win_rate ? `${parseFloat(performance.win_rate).toFixed(1)}%` : 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">
                <FaArrowUp />
              </div>
              <div className="metric-content">
                <span className="metric-label">Total Trades</span>
                <span className="metric-value">
                  {performance.total_trades || 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">
                <FaExclamationTriangle />
              </div>
              <div className="metric-content">
                <span className="metric-label">Max Drawdown</span>
                <span className="metric-value negative">
                  {performance.max_drawdown_percent ? `${parseFloat(performance.max_drawdown_percent).toFixed(2)}%` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="metric-section">
          <h4>Risk Metrics</h4>
          <div className="metric-cards">
            <div className="metric-card">
              <div className="metric-content">
                <span className="metric-label">Sharpe Ratio</span>
                <span className="metric-value">
                  {performance.sharpe_ratio ? parseFloat(performance.sharpe_ratio).toFixed(2) : 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-content">
                <span className="metric-label">Sortino Ratio</span>
                <span className="metric-value">
                  {performance.sortino_ratio ? parseFloat(performance.sortino_ratio).toFixed(2) : 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-content">
                <span className="metric-label">Calmar Ratio</span>
                <span className="metric-value">
                  {performance.calmar_ratio ? parseFloat(performance.calmar_ratio).toFixed(2) : 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-content">
                <span className="metric-label">Volatility</span>
                <span className="metric-value">
                  {performance.volatility ? `${parseFloat(performance.volatility).toFixed(2)}%` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Statistics */}
        <div className="metric-section">
          <h4>Trading Statistics</h4>
          <div className="metric-cards">
            <div className="metric-card">
              <div className="metric-content">
                <span className="metric-label">Profit Factor</span>
                <span className="metric-value">
                  {performance.profit_factor ? parseFloat(performance.profit_factor).toFixed(2) : 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-content">
                <span className="metric-label">Avg Win</span>
                <span className="metric-value positive">
                  {performance.avg_win ? `$${parseFloat(performance.avg_win).toFixed(2)}` : 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-content">
                <span className="metric-label">Avg Loss</span>
                <span className="metric-value negative">
                  {performance.avg_loss ? `$${parseFloat(performance.avg_loss).toFixed(2)}` : 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-content">
                <span className="metric-label">Largest Win</span>
                <span className="metric-value positive">
                  {performance.largest_win ? `$${parseFloat(performance.largest_win).toFixed(2)}` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Capital Summary */}
        <div className="metric-section">
          <h4>Capital Summary</h4>
          <div className="capital-summary">
            <div className="capital-item">
              <span className="capital-label">Initial Capital</span>
              <span className="capital-value">${(settings.initial_capital || 10000).toLocaleString()}</span>
            </div>
            <div className="capital-item">
              <span className="capital-label">Final Capital</span>
              <span className="capital-value">${(performance.final_capital || 0).toLocaleString()}</span>
            </div>
            <div className="capital-item">
              <span className="capital-label">Net Profit</span>
              <span className={`capital-value ${parseFloat(performance.total_return || 0) >= 0 ? 'positive' : 'negative'}`}>
                ${(parseFloat(performance.total_return || 0)).toLocaleString()}
              </span>
            </div>
            <div className="capital-item">
              <span className="capital-label">ROI</span>
              <span className={`capital-value ${parseFloat(performance.total_return_percent || 0) >= 0 ? 'positive' : 'negative'}`}>
                {performance.total_return_percent ? `${parseFloat(performance.total_return_percent).toFixed(2)}%` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="strategy-details-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading strategy details for ID: {id}...</p>
        </div>
      </div>
    );
  }

  if (error || !strategy) {
    return (
      <div className="strategy-details-page">
        <Header />
        <div className="error-container">
          <FaExclamationTriangle className="error-icon" />
          <h3>Strategy Not Found</h3>
          <p>{error || 'The requested strategy could not be found.'}</p>

          <button onClick={() => navigate('/strategies')} className="btn btn-primary">
            <FaArrowLeft /> Back to Strategies
          </button>
          <button onClick={loadStrategyDetails} className="btn btn-secondary" style={{ marginLeft: '10px' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="strategy-details-page">
      <Header />
      

      
      <div className="strategy-details-container">
        <div className="strategy-header">
          <button onClick={() => navigate('/strategies')} className="btn btn-secondary">
            <FaArrowLeft /> Back to Strategies
          </button>
          
          <div className="strategy-title">
            <h1>{cleanStrategyName(strategy.name)}</h1>
            <p>{strategy.description}</p>
          </div>
          
          <div className="strategy-actions">
            <button onClick={handleRunBacktest} className="btn btn-primary">
              <FaRocket /> Run Backtest
            </button>
            <button onClick={handleDelete} className="btn btn-danger">
              <FaTrash /> Delete
            </button>
          </div>
        </div>

        <div className="strategy-content">
          <div className="strategy-info">
            <div className="info-card">
              <h3>Strategy Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Symbol:</span>
                  <span className="info-value">{strategy.symbol}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Timeframe:</span>
                  <span className="info-value">{strategy.timeframe}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Initial Capital:</span>
                  <span className="info-value">${(strategy.initial_capital || 10000).toLocaleString()}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span className={`info-value status-${strategy.status}`}>{strategy.status}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="strategy-chart">
            <div className="chart-card">
              {renderProfitLossChart()}
            </div>
          </div>

          <div className="strategy-metrics">
            <div className="metrics-card">
              {renderMetrics()}
            </div>
          </div>

          {backtestId && (
            <div className="strategy-charts">
              <BacktestCharts 
                backtestId={backtestId} 
                backtestData={backtestResults}
                trades={backtestResults?.trades || []}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrategyDetails;
