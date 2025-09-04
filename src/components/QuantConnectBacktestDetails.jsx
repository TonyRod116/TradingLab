import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { FaArrowLeft, FaChartLine, FaTrophy, FaDollarSign, FaArrowUp, FaArrowDown, FaCalendarAlt, FaClock, FaCheckCircle, FaExclamationTriangle, FaCog } from 'react-icons/fa';
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
import { toast } from 'react-toastify';
import { strategyAPI } from '../config/api';
import './QuantConnectBacktestDetails.css';

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

const QuantConnectBacktestDetails = () => {
  const { strategyId: paramStrategyId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [strategy, setStrategy] = useState(null);
  const [backtestData, setBacktestData] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isSavedStrategy, setIsSavedStrategy] = useState(false);
  
  // Get strategyId from either params or search params
  const strategyId = paramStrategyId || searchParams.get('strategyId');

  useEffect(() => {
    if (location.state?.backtestData && location.state?.strategy) {
      // Datos pasados desde la navegación (Run Backtest)
      console.log('📊 QuantConnect Backtest Data:', location.state.backtestData);
      console.log('📊 Available data keys:', Object.keys(location.state.backtestData));
      console.log('📊 Total Return:', location.state.backtestData.total_return);
      console.log('📊 Sharpe Ratio:', location.state.backtestData.sharpe_ratio);
      console.log('📊 Max Drawdown:', location.state.backtestData.max_drawdown);
      console.log('📊 Win Rate:', location.state.backtestData.win_rate);
      console.log('📊 Full backtest data structure:', JSON.stringify(location.state.backtestData, null, 2));
      setBacktestData(location.state.backtestData);
      setStrategy(location.state.strategy);
      setIsSavedStrategy(false); // Es un backtest nuevo
      setLoading(false);
    } else if (strategyId) {
      // Cargar datos desde la API (Estrategia guardada)
      setIsSavedStrategy(true); // Es una estrategia guardada
      loadBacktestDetails();
    } else {
      setError('No backtest data available');
      setLoading(false);
    }
  }, [strategyId, location.state]);

  const loadBacktestDetails = async () => {
    try {
      setLoading(true);
      
      // Cargar datos de la estrategia desde la API
      const response = await strategyAPI.getStrategy(strategyId);
      if (response) {
        setStrategy(response);
        
        // Si la estrategia tiene datos de backtest, los mostramos
        if (response.latest_backtest) {
          setBacktestData(response.latest_backtest);
        } else {
          // Si no hay datos de backtest, mostramos solo la información de la estrategia
          setBacktestData(null);
        }
      } else {
        setError('Strategy not found');
      }
    } catch (err) {
      console.error('Error loading strategy details:', err);
      setError('Failed to load strategy details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStrategy = async () => {
    if (!strategy) return;
    
    setSaving(true);
    try {
      // Intentar guardar con el nombre original
      let response = await strategyAPI.createStrategy(strategy);
      
      // Si hay error de duplicado, generar nombre único
      if (!response || !response.id) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const uniqueStrategy = {
          ...strategy,
          name: `${strategy.name}_${timestamp}`
        };
        
        response = await strategyAPI.createStrategy(uniqueStrategy);
      }
      
      if (response && response.id) {
        toast.success('Strategy saved successfully!');
        // Navegar a la página de estrategias después de guardar
        setTimeout(() => {
          navigate('/strategies');
        }, 1500);
      } else {
        throw new Error('No strategy ID returned from backend');
      }
    } catch (error) {
      console.error('Error saving strategy:', error);
      
      // Si es error de duplicado, intentar con nombre único
      if (error.message.includes('500') || error.message.includes('duplicate')) {
        try {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const uniqueStrategy = {
            ...strategy,
            name: `${strategy.name}_${timestamp}`
          };
          
          const response = await strategyAPI.createStrategy(uniqueStrategy);
          if (response && response.id) {
            toast.success(`Strategy saved as "${uniqueStrategy.name}"!`);
            setTimeout(() => {
              navigate('/strategies');
            }, 1500);
            return;
          }
        } catch (retryError) {
          console.error('Error saving strategy with unique name:', retryError);
        }
      }
      
      toast.error(`Error saving strategy: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

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


  const getPerformanceMetrics = () => {
    if (!backtestData) return [];
    
    return [
      {
        title: 'Total Return',
        value: formatPercentage((backtestData.total_return || backtestData.total_return_percent || 0) / 100),
        icon: FaArrowUp,
        color: (backtestData.total_return || backtestData.total_return_percent || 0) >= 0 ? '#28a745' : '#dc3545',
        description: 'Overall portfolio performance'
      },
      {
        title: 'Sharpe Ratio',
        value: formatNumber(backtestData.sharpe_ratio || 0),
        icon: FaTrophy,
        color: backtestData.sharpe_ratio >= 1 ? '#28a745' : backtestData.sharpe_ratio >= 0.5 ? '#ffc107' : '#dc3545',
        description: 'Risk-adjusted returns'
      },
      {
        title: 'Max Drawdown',
        value: formatPercentage((backtestData.max_drawdown || 0) / 100),
        icon: FaArrowDown,
        color: '#dc3545',
        description: 'Largest peak-to-trough decline'
      },
      {
        title: 'Win Rate',
        value: formatPercentage((backtestData.win_rate || 0) / 100),
        icon: FaCheckCircle,
        color: (backtestData.win_rate || 0) >= 0.5 ? '#28a745' : '#dc3545',
        description: 'Percentage of winning trades'
      },
      {
        title: 'Profit Factor',
        value: formatNumber(backtestData.profit_factor || 0),
        icon: FaDollarSign,
        color: backtestData.profit_factor >= 1.5 ? '#28a745' : backtestData.profit_factor >= 1 ? '#ffc107' : '#dc3545',
        description: 'Gross profit / Gross loss'
      },
      {
        title: 'Total Trades',
        value: backtestData.total_trades || 0,
        icon: FaChartLine,
        color: '#007bff',
        description: 'Number of executed trades'
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
      <div className="backtest-loading">
        <div className="loading-spinner">
          <FaClock className="spinner" />
          <p>Loading backtest results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="backtest-error">
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

  return (
    <div className="quantconnect-backtest">
      <div className="backtest-header">
        <button 
          className="btn btn-secondary back-btn"
          onClick={() => navigate('/strategies')}
        >
          <FaArrowLeft />
          Back to Strategies
        </button>
        
        <div className="header-info">
          <h1>QuantConnect Backtest Results</h1>
          <p>{strategy?.name || 'Strategy Performance Analysis'}</p>
        </div>
        
        <div className="header-actions">
          {!isSavedStrategy && (
            <>
              <button 
                className="btn btn-outline cancel-btn"
                onClick={() => navigate('/strategies')}
              >
                <FaArrowLeft />
                Cancel
              </button>
              <button 
                className="btn btn-primary save-btn"
                onClick={handleSaveStrategy}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <FaClock className="spinner" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaCog />
                    Save Strategy
                  </>
                )}
              </button>
            </>
          )}
          {isSavedStrategy && (
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/strategies')}
            >
              <FaArrowLeft />
              Back to Strategies
            </button>
          )}
        </div>
      </div>

      <div className="backtest-content">
        {/* Data Source Info */}
        <div className="data-source-info">
          <h3>📊 QuantConnect Backtest Results</h3>
          <div className="source-details">
            <div className="source-item">
              <strong>✅ Real Data:</strong> All metrics and results directly from QuantConnect API
            </div>
            <div className="source-item">
              <strong>🔗 Source:</strong> QuantConnect via Django backend
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="performance-overview">
          <h2>Performance Overview</h2>
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
                    <span className="metric-description">{metric.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real Data Charts */}
        {backtestData && (
          <div className="real-data-charts">
            <h2>Performance Metrics Visualization</h2>
            <div className="charts-grid">
              {/* Sharpe Ratio vs Benchmark */}
              <div className="chart-container">
                <h3>Risk-Adjusted Performance</h3>
                <Bar 
                  data={{
                    labels: ['Sharpe Ratio', 'Benchmark (1.0)'],
                    datasets: [{
                      label: 'Risk-Adjusted Return',
                      data: [backtestData.sharpe_ratio || 0, 1.0],
                      backgroundColor: [
                        (backtestData.sharpe_ratio || 0) >= 1 ? '#00ff88' : (backtestData.sharpe_ratio || 0) >= 0.5 ? '#ffc107' : '#ff6b6b',
                        '#6c757d'
                      ],
                      borderColor: [
                        (backtestData.sharpe_ratio || 0) >= 1 ? '#00ff88' : (backtestData.sharpe_ratio || 0) >= 0.5 ? '#ffc107' : '#ff6b6b',
                        '#6c757d'
                      ],
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      y: { beginAtZero: true }
                    }
                  }}
                />
              </div>

              {/* Return vs Drawdown */}
              <div className="chart-container">
                <h3>Return vs Risk</h3>
                <Bar 
                  data={{
                    labels: ['Total Return (%)', 'Max Drawdown (%)'],
                    datasets: [{
                      label: 'Performance',
                      data: [
                        backtestData.total_return || backtestData.total_return_percent || 0,
                        Math.abs(backtestData.max_drawdown || 0)
                      ],
                      backgroundColor: [
                        (backtestData.total_return || backtestData.total_return_percent || 0) >= 0 ? '#00ff88' : '#ff6b6b',
                        '#ff6b6b'
                      ],
                      borderColor: [
                        (backtestData.total_return || backtestData.total_return_percent || 0) >= 0 ? '#00ff88' : '#ff6b6b',
                        '#ff6b6b'
                      ],
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      y: { beginAtZero: true }
                    }
                  }}
                />
              </div>

              {/* Win Rate */}
              {backtestData.win_rate && (
                <div className="chart-container">
                  <h3>Win Rate</h3>
                  <div className="win-rate-chart">
                    <div 
                      className="win-rate-circle"
                      style={{ '--win-rate': (backtestData.win_rate || 0) }}
                    >
                      <div className="win-rate-text">
                        {formatPercentage((backtestData.win_rate || 0) / 100)}
                      </div>
                      <div className="win-rate-label">Win Rate</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Profit Factor */}
              {backtestData.profit_factor && (
                <div className="chart-container">
                  <h3>Profit Factor</h3>
                  <Bar 
                    data={{
                      labels: ['Profit Factor', 'Break-even (1.0)'],
                      datasets: [{
                        label: 'Profit Factor',
                        data: [backtestData.profit_factor || 0, 1.0],
                        backgroundColor: [
                          (backtestData.profit_factor || 0) >= 1.5 ? '#00ff88' : (backtestData.profit_factor || 0) >= 1 ? '#ffc107' : '#ff6b6b',
                          '#6c757d'
                        ],
                        borderColor: [
                          (backtestData.profit_factor || 0) >= 1.5 ? '#00ff88' : (backtestData.profit_factor || 0) >= 1 ? '#ffc107' : '#ff6b6b',
                          '#6c757d'
                        ],
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false }
                      },
                      scales: {
                        y: { beginAtZero: true }
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

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
        {strategy && (
          <div className="strategy-details">
            <h3>Strategy Details</h3>
            <div className="strategy-info">
              <div className="info-grid">
                <div className="info-item">
                  <strong>Strategy Name:</strong> {strategy.name}
                </div>
                <div className="info-item">
                  <strong>Symbol:</strong> {strategy.symbol}
                </div>
                <div className="info-item">
                  <strong>Initial Capital:</strong> {formatCurrency(strategy.initial_capital)}
                </div>
                <div className="info-item">
                  <strong>Backtest Period:</strong> {strategy.start_date} to {strategy.end_date}
                </div>
                <div className="info-item">
                  <strong>Strategy Method:</strong> {strategy.strategy_method === 'rule_builder' ? 'Rule Builder' : 'Natural Language'}
                </div>
              </div>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuantConnectBacktestDetails;
