import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaDownload, FaShare, FaChartLine, FaTrophy, FaExclamationTriangle, FaCheckCircle, FaClock, FaDollarSign, FaArrowUp, FaArrowDown, FaPercent, FaCalendarAlt } from 'react-icons/fa';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import './BacktestResults.css';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const BacktestResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [backtestData, setBacktestData] = useState(null);
  const [strategyData, setStrategyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Obtener datos del backtest desde la navegación
    console.log('BacktestResults - location.state:', location.state);
    if (location.state?.backtestData) {
      console.log('BacktestResults - backtestData:', location.state.backtestData);
      setBacktestData(location.state.backtestData);
      setStrategyData(location.state.strategyData);
      setLoading(false);
    } else {
      console.log('BacktestResults - No backtest data available');
      setError('No backtest data available');
      setLoading(false);
    }
  }, [location.state]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatNumber = (value, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  // Datos para gráficos
  const getEquityCurveData = () => {
    if (!backtestData?.equity_curve) return null;
    
    const dates = backtestData.equity_curve.map(point => point.date);
    const values = backtestData.equity_curve.map(point => point.value);
    
    return {
      labels: dates,
      datasets: [
        {
          label: 'Portfolio Value',
          data: values,
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          fill: true,
          tension: 0.1
        }
      ]
    };
  };

  const getDrawdownData = () => {
    if (!backtestData?.drawdown_curve) return null;
    
    const dates = backtestData.drawdown_curve.map(point => point.date);
    const values = backtestData.drawdown_curve.map(point => point.drawdown);
    
    return {
      labels: dates,
      datasets: [
        {
          label: 'Drawdown',
          data: values,
          borderColor: '#dc3545',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          fill: true
        }
      ]
    };
  };

  const getMonthlyReturnsData = () => {
    if (!backtestData?.monthly_returns) return null;
    
    const months = backtestData.monthly_returns.map(item => item.month);
    const returns = backtestData.monthly_returns.map(item => item.return * 100);
    
    return {
      labels: months,
      datasets: [
        {
          label: 'Monthly Returns (%)',
          data: returns,
          backgroundColor: returns.map(r => r >= 0 ? '#28a745' : '#dc3545'),
          borderColor: returns.map(r => r >= 0 ? '#28a745' : '#dc3545'),
          borderWidth: 1
        }
      ]
    };
  };

  const getPerformanceMetrics = () => {
    if (!backtestData) return [];
    
    return [
      {
        title: 'Total Return',
        value: formatPercentage((backtestData.total_return || backtestData.total_return_percent || 0) / 100),
        icon: FaArrowUp,
        color: (backtestData.total_return || backtestData.total_return_percent || 0) >= 0 ? '#28a745' : '#dc3545'
      },
      {
        title: 'Annual Return',
        value: formatPercentage((backtestData.annual_return || 0) / 100),
        icon: FaCalendarAlt,
        color: (backtestData.annual_return || 0) >= 0 ? '#28a745' : '#dc3545'
      },
      {
        title: 'Sharpe Ratio',
        value: formatNumber(backtestData.sharpe_ratio || 0),
        icon: FaTrophy,
        color: backtestData.sharpe_ratio >= 1 ? '#28a745' : backtestData.sharpe_ratio >= 0.5 ? '#ffc107' : '#dc3545'
      },
      {
        title: 'Max Drawdown',
        value: formatPercentage((backtestData.max_drawdown || 0) / 100),
        icon: FaArrowDown,
        color: '#dc3545'
      },
      {
        title: 'Win Rate',
        value: formatPercentage((backtestData.win_rate || 0) / 100),
        icon: FaCheckCircle,
        color: (backtestData.win_rate || 0) >= 0.5 ? '#28a745' : '#dc3545'
      },
      {
        title: 'Profit Factor',
        value: formatNumber(backtestData.profit_factor || 0),
        icon: FaDollarSign,
        color: backtestData.profit_factor >= 1.5 ? '#28a745' : backtestData.profit_factor >= 1 ? '#ffc107' : '#dc3545'
      }
    ];
  };

  const getTradeAnalysis = () => {
    if (!backtestData) return null;
    
    return {
      totalTrades: backtestData.total_trades || 0,
      winningTrades: backtestData.winning_trades || 0,
      losingTrades: backtestData.losing_trades || 0,
      avgWin: backtestData.avg_win || 0,
      avgLoss: backtestData.avg_loss || 0,
      largestWin: backtestData.largest_win || 0,
      largestLoss: backtestData.largest_loss || 0
    };
  };

  if (loading) {
    return (
      <div className="backtest-results-loading">
        <div className="loading-spinner">
          <FaClock className="spinner" />
          <p>Loading backtest results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="backtest-results-error">
        <FaExclamationTriangle className="error-icon" />
        <h3>Error Loading Results</h3>
        <p>{error}</p>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/strategies')}
        >
          <FaArrowLeft />
          Back to Strategies
        </button>
      </div>
    );
  }

  const performanceMetrics = getPerformanceMetrics();
  const tradeAnalysis = getTradeAnalysis();
  const equityCurveData = getEquityCurveData();
  const drawdownData = getDrawdownData();
  const monthlyReturnsData = getMonthlyReturnsData();

  return (
    <div className="backtest-results">
      <div className="backtest-results-header">
        <button 
          className="btn btn-secondary back-btn"
          onClick={() => navigate('/strategies')}
        >
          <FaArrowLeft />
          Back to Strategies
        </button>
        
        <div className="header-info">
          <h1>Backtest Results</h1>
          <p>{strategyData?.name || 'Strategy Performance'}</p>
        </div>
        
        <div className="header-actions">
          <button className="btn btn-outline">
            <FaDownload />
            Export
          </button>
          <button className="btn btn-outline">
            <FaShare />
            Share
          </button>
        </div>
      </div>

      <div className="backtest-results-content">
        {/* Performance Metrics */}
        <div className="metrics-grid">
          {performanceMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div key={index} className="metric-card">
                <div className="metric-icon" style={{ color: metric.color }}>
                  <IconComponent />
                </div>
                <div className="metric-content">
                  <h4>{metric.title}</h4>
                  <p style={{ color: metric.color }}>{metric.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-container">
            <h3>Equity Curve</h3>
            {equityCurveData ? (
              <Line 
                data={equityCurveData} 
                options={{
                  responsive: true,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Portfolio Value Over Time'
                    },
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: false,
                      ticks: {
                        callback: function(value) {
                          return formatCurrency(value);
                        }
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="no-data">No equity curve data available</div>
            )}
          </div>

          <div className="chart-container">
            <h3>Drawdown</h3>
            {drawdownData ? (
              <Line 
                data={drawdownData} 
                options={{
                  responsive: true,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Drawdown Over Time'
                    },
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return formatPercentage(value);
                        }
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="no-data">No drawdown data available</div>
            )}
          </div>

          <div className="chart-container">
            <h3>Monthly Returns</h3>
            {monthlyReturnsData ? (
              <Bar 
                data={monthlyReturnsData} 
                options={{
                  responsive: true,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Monthly Returns Distribution'
                    },
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return value + '%';
                        }
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="no-data">No monthly returns data available</div>
            )}
          </div>
        </div>

        {/* Trade Analysis */}
        {tradeAnalysis && (
          <div className="trade-analysis">
            <h3>Trade Analysis</h3>
            <div className="trade-stats">
              <div className="trade-stat">
                <h4>Total Trades</h4>
                <p>{tradeAnalysis.totalTrades}</p>
              </div>
              <div className="trade-stat">
                <h4>Winning Trades</h4>
                <p style={{ color: '#28a745' }}>{tradeAnalysis.winningTrades}</p>
              </div>
              <div className="trade-stat">
                <h4>Losing Trades</h4>
                <p style={{ color: '#dc3545' }}>{tradeAnalysis.losingTrades}</p>
              </div>
              <div className="trade-stat">
                <h4>Average Win</h4>
                <p style={{ color: '#28a745' }}>{formatCurrency(tradeAnalysis.avgWin)}</p>
              </div>
              <div className="trade-stat">
                <h4>Average Loss</h4>
                <p style={{ color: '#dc3545' }}>{formatCurrency(tradeAnalysis.avgLoss)}</p>
              </div>
              <div className="trade-stat">
                <h4>Largest Win</h4>
                <p style={{ color: '#28a745' }}>{formatCurrency(tradeAnalysis.largestWin)}</p>
              </div>
              <div className="trade-stat">
                <h4>Largest Loss</h4>
                <p style={{ color: '#dc3545' }}>{formatCurrency(tradeAnalysis.largestLoss)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Strategy Details */}
        {strategyData && (
          <div className="strategy-details">
            <h3>Strategy Details</h3>
            <div className="strategy-info">
              <div className="info-item">
                <strong>Symbol:</strong> {strategyData.symbol}
              </div>
              <div className="info-item">
                <strong>Timeframe:</strong> {strategyData.timeframe}
              </div>
              <div className="info-item">
                <strong>Initial Capital:</strong> {formatCurrency(strategyData.initial_capital)}
              </div>
              <div className="info-item">
                <strong>Backtest Period:</strong> {strategyData.start_date} to {strategyData.end_date}
              </div>
              {strategyData.lean_code && (
                <div className="info-item">
                  <strong>Strategy Code:</strong>
                  <pre className="code-block">{strategyData.lean_code}</pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BacktestResults;