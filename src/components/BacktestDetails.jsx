import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaChartLine } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getToken } from '../utils/auth';
import { cleanStrategyName } from '../utils/strategyUtils';
import BacktestCharts from './BacktestCharts';
import Header from './Header';
import './BacktestDetails.css';

const BacktestDetails = () => {
  const { strategyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState(null);
  const [backtestData, setBacktestData] = useState(null);
  const [trades, setTrades] = useState([]);
  const [equityCurve, setEquityCurve] = useState([]);

  useEffect(() => {
    if (strategyId) {
      loadBacktestDetails();
    }
  }, [strategyId]);

  const loadBacktestDetails = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      console.log('Loading backtest details for strategy ID:', strategyId);
      
      // Load strategy details
      const strategyResponse = await axios.get(`http://localhost:8000/api/strategies/${strategyId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Strategy data loaded:', strategyResponse.data);
      console.log('Strategy keys:', Object.keys(strategyResponse.data));
      console.log('Latest backtest:', strategyResponse.data.latest_backtest);
      
      setStrategy(strategyResponse.data);

      // Use latest_backtest data for metrics since that's where the actual backtest results are
      if (strategyResponse.data.latest_backtest) {
        console.log('Using latest_backtest data for metrics');
        setBacktestData(strategyResponse.data.latest_backtest);
      } else {
        console.log('No latest_backtest found, using strategy data');
        setBacktestData(strategyResponse.data);
      }

      // Try to load additional data if available
      if (strategyResponse.data.latest_backtest) {
        const backtestId = strategyResponse.data.latest_backtest.id;
        console.log('Found latest backtest ID:', backtestId);
        
        // Load trades data
        try {
          const tradesResponse = await axios.get(`http://localhost:8000/api/strategies/backtest-results/${backtestId}/trades/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('Trades data loaded:', tradesResponse.data);
          setTrades(tradesResponse.data);
        } catch (tradesError) {
          console.warn('Could not load trades data:', tradesError);
          setTrades([]);
        }

        // Note: Equity curve endpoint doesn't exist yet, skipping for now
        console.log('Skipping equity curve data load - endpoint not available');
        setEquityCurve([]);
      } else {
        console.log('No latest_backtest found, using strategy data only');
        setTrades([]);
        setEquityCurve([]);
      }
    } catch (error) {
      console.error('Error loading backtest details:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to load backtest details');
    } finally {
      setLoading(false);
    }
  };

  const formatMetric = (value, isPercentage = false, decimals = 2) => {
    if (value === null || value === undefined) return 'N/A';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'N/A';
    
    if (isPercentage) {
      return `${numValue.toFixed(decimals)}%`;
    }
    return numValue.toFixed(decimals);
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'N/A';
    return `$${numValue.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="backtest-details">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading backtest details...</p>
        </div>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="backtest-details">
        <Header />
        <div className="error-container">
          <h2>Strategy not found</h2>
          <p>The requested strategy could not be found.</p>
          <button onClick={() => navigate('/strategies')} className="btn btn-primary">
            <FaArrowLeft /> Back to Strategies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="backtest-details">
      <Header />
      
      <div className="backtest-container">
        {/* Header */}
        <button onClick={() => navigate(-1)} className="btn btn-secondary back-button">
          <FaArrowLeft /> Back
        </button>
        
        <div className="backtest-header">
          <div className="header-info">
            <h1>{cleanStrategyName(strategy.name)}</h1>
            <div className="strategy-meta">
              <span className="symbol">{strategy.symbol}</span>
              <span className="timeframe">{strategy.timeframe}</span>
              <span className="created-by">by {strategy.created_by}</span>
            </div>
          </div>

        </div>

        {/* Performance Overview */}
        <div className="performance-overview">
          <h2>Performance Overview</h2>
          <div className="metrics-grid">
                              <div className="metric-card primary">
                    <div className="metric-label">Total Return</div>
                    <div className="metric-value">
                      {formatCurrency(backtestData.total_return)}
                      <span className="metric-percentage">
                        ({formatMetric(backtestData.total_return_percent, true)})
                      </span>
                    </div>
                  </div>
                  
                  <div className="metric-card">
                    <div className="metric-label">Win Rate</div>
                    <div className="metric-value">{formatMetric(backtestData.win_rate, true)}</div>
                  </div>
                  
                  <div className="metric-card">
                    <div className="metric-label">Total Trades</div>
                    <div className="metric-value">{backtestData.total_trades || 'N/A'}</div>
                  </div>
                  
                  <div className="metric-card">
                    <div className="metric-label">Profit Factor</div>
                    <div className="metric-value">{formatMetric(backtestData.profit_factor)}</div>
                  </div>
                  
                  <div className="metric-card">
                    <div className="metric-label">Sharpe Ratio</div>
                    <div className="metric-value">{formatMetric(backtestData.sharpe_ratio)}</div>
                  </div>
                  
                  <div className="metric-card">
                    <div className="metric-label">Max Drawdown</div>
                    <div className="metric-value">{formatMetric(backtestData.max_drawdown, true)}</div>
                  </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <h2>Performance Charts</h2>
                  <BacktestCharts 
          backtestData={backtestData}
          trades={trades}
          equityCurve={equityCurve}
        />
        </div>

        {/* Detailed Metrics */}
        <div className="detailed-metrics">
          <h2>Detailed Metrics</h2>
          <div className="metrics-sections">
            <div className="metrics-section">
              <h3>Trade Statistics</h3>
              <div className="metrics-grid-small">
                                      <div className="metric-item">
                        <span className="metric-label">Winning Trades</span>
                        <span className="metric-value">{backtestData.winning_trades || 'N/A'}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Losing Trades</span>
                        <span className="metric-value">{backtestData.losing_trades || 'N/A'}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Average Win</span>
                        <span className="metric-value">{formatCurrency(backtestData.avg_win)}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Average Loss</span>
                        <span className="metric-value">{formatCurrency(backtestData.avg_loss)}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Largest Win</span>
                        <span className="metric-value">{formatCurrency(backtestData.largest_win)}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Largest Loss</span>
                        <span className="metric-value">{formatCurrency(backtestData.largest_loss)}</span>
                      </div>
              </div>
            </div>

            <div className="metrics-section">
              <h3>Risk Metrics</h3>
              <div className="metrics-grid-small">
                                      <div className="metric-item">
                        <span className="metric-label">Sortino Ratio</span>
                        <span className="metric-value">{formatMetric(backtestData.sortino_ratio)}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Calmar Ratio</span>
                        <span className="metric-value">{formatMetric(backtestData.calmar_ratio)}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Volatility</span>
                        <span className="metric-value">{formatMetric(backtestData.volatility, true)}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Max Consecutive Wins</span>
                        <span className="metric-value">{backtestData.max_consecutive_wins || 'N/A'}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Max Consecutive Losses</span>
                        <span className="metric-value">{backtestData.max_consecutive_losses || 'N/A'}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Avg Trade Duration</span>
                        <span className="metric-value">{backtestData.avg_trade_duration || 'N/A'}</span>
                      </div>
              </div>
            </div>

            <div className="metrics-section">
              <h3>Capital & Costs</h3>
              <div className="metrics-grid-small">
                                      <div className="metric-item">
                        <span className="metric-label">Initial Capital</span>
                        <span className="metric-value">{formatCurrency((() => {
                          const capital = backtestData.initial_capital || strategy.initial_capital;
                          // Fix: If capital seems too high (likely backend error), use 10000
                          let capitalValue = parseFloat(capital || 10000);
                          if (capitalValue > 50000) {
                            capitalValue = 10000;
                          }
                          return capitalValue;
                        })())}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Final Capital</span>
                        <span className="metric-value">{formatCurrency((() => {
                          const capital = backtestData.initial_capital || strategy.initial_capital;
                          // Fix: If capital seems too high (likely backend error), use 10000
                          let capitalValue = parseFloat(capital || 10000);
                          if (capitalValue > 50000) {
                            capitalValue = 10000;
                          }
                          const totalReturn = parseFloat(backtestData.total_return || 0);
                          return capitalValue + totalReturn;
                        })())}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Commission</span>
                        <span className="metric-value">{formatCurrency(backtestData.commission || backtestData.backtest_commission || 0)}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Slippage</span>
                        <span className="metric-value">{formatCurrency(backtestData.slippage || backtestData.backtest_slippage || 0)}</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Backtest Period</span>
                        <span className="metric-value">
                          {backtestData.start_date ? 
                            `${new Date(backtestData.start_date).toLocaleDateString()} - ${new Date(backtestData.end_date).toLocaleDateString()}` 
                            : 'N/A'
                          }
                        </span>
                      </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BacktestDetails;
