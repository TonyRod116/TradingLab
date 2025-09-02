import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area,
  ComposedChart
} from 'recharts';
import { FaChartLine, FaSpinner } from 'react-icons/fa';
import './BacktestCharts.css';

const BacktestCharts = ({ backtestId, backtestData: propBacktestData, trades: propTrades }) => {
  const [backtestData, setBacktestData] = useState(propBacktestData);
  const [trades, setTrades] = useState(propTrades || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (propBacktestData) {
      setBacktestData(propBacktestData);
    }
    if (propTrades) {
      setTrades(propTrades);
    }
  }, [propBacktestData, propTrades]);

  useEffect(() => {
    if (backtestId && !propBacktestData) {
      fetchData();
    }
  }, [backtestId, propBacktestData]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener datos del backtest usando el endpoint correcto
      const backtestResponse = await fetch(`http://localhost:8000/api/strategies/backtest-results/${backtestId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Obtener trades individuales usando el endpoint correcto
      const tradesResponse = await fetch(`http://localhost:8000/api/strategies/backtest-results/${backtestId}/trades/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Backtest response status:', backtestResponse.status);
      console.log('Trades response status:', tradesResponse.status);
      
      if (backtestResponse.ok && tradesResponse.ok) {
        const backtest = await backtestResponse.json();
        const tradesData = await tradesResponse.json();
        
        console.log('Backtest data received:', backtest);
        console.log('Trades data received:', tradesData);
        
        setBacktestData(backtest);
        setTrades(tradesData);
      } else {
        // Log the actual response content to see what's being returned
        const backtestText = await backtestResponse.text();
        const tradesText = await tradesResponse.text();
        
        console.error('Backtest response error:', backtestText);
        console.error('Trades response error:', tradesText);
        
        setError(`Failed to fetch backtest data. Backtest status: ${backtestResponse.status}, Trades status: ${tradesResponse.status}`);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error loading charts data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="charts-loading">
        <FaSpinner className="spinner" />
        <p>Loading charts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="charts-error">
        <p>Error loading charts: {error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  if (!backtestData) {
    return (
      <div className="charts-no-data">
        <FaChartLine className="no-data-icon" />
        <p>No backtest data available</p>
        <p>Run a backtest first to see charts</p>
      </div>
    );
  }

  if (!trades || trades.length === 0) {
    return (
      <div className="charts-no-data">
        <FaChartLine className="no-data-icon" />
        <p>No trades data available</p>
        <p>This backtest has no trades to display</p>
      </div>
    );
  }

  // Debug log
  console.log('BacktestCharts rendering with:', {
    backtestId,
    backtestData,
    trades: trades?.length || 0,
    hasTrades: trades && trades.length > 0
  });

  return (
    <div className="backtest-charts">
      <div className="charts-header">
        <h3>📊 Backtest Analysis Charts</h3>
        <p>Comprehensive visual analysis of your strategy performance</p>
        <div style={{ 
          background: 'rgba(0,255,0,0.1)', 
          border: '1px solid green', 
          padding: '5px', 
          margin: '5px',
          color: 'white',
          fontSize: '10px'
        }}>
          DEBUG: Backtest ID: {backtestId}, Trades: {trades?.length || 0}
        </div>
      </div>
      
      <div className="chart-grid">
        <EquityCurveChart 
          trades={trades} 
          initialCapital={backtestData.initial_capital}
          startDate={backtestData.start_date}
          endDate={backtestData.end_date}
        />
        
        <DrawdownChart 
          trades={trades} 
          initialCapital={backtestData.initial_capital}
        />
        
        <TradesChart trades={trades} />
        
        <ReturnsDistributionChart trades={trades} />
        
        <MonthlyReturnsChart trades={trades} />
        
        <WinLossChart trades={trades} />
      </div>
    </div>
  );
};

// Equity Curve Chart
const EquityCurveChart = ({ trades, initialCapital, startDate, endDate }) => {
  const calculateEquityCurve = () => {
    const equityData = [];
    let currentCapital = parseFloat(initialCapital);
    
    // Crear puntos de tiempo desde start_date hasta end_date
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timePoints = [];
    
    // Generar puntos de tiempo cada día
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      timePoints.push(new Date(d));
    }
    
    // Para cada punto de tiempo, calcular el capital acumulado
    timePoints.forEach(timePoint => {
      const tradesUpToDate = trades.filter(trade => 
        new Date(trade.exit_date) <= timePoint
      );
      
      const totalPnL = tradesUpToDate.reduce((sum, trade) => 
        sum + parseFloat(trade.net_pnl || 0), 0
      );
      
      equityData.push({
        date: timePoint.toISOString().split('T')[0],
        value: currentCapital + totalPnL,
        pnl: totalPnL
      });
    });
    
    return equityData;
  };

  const equityData = calculateEquityCurve();

  return (
    <div className="chart-item equity-chart">
      <h4>📈 Equity Curve</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={equityData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            stroke="var(--color-text-secondary)"
            fontSize={12}
          />
          <YAxis 
            stroke="var(--color-text-secondary)"
            fontSize={12}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid var(--color-green)',
              borderRadius: '8px',
              color: 'var(--color-white)'
            }}
            formatter={(value, name) => [
              name === 'value' ? `$${value.toLocaleString()}` : `$${value.toLocaleString()}`,
              name === 'value' ? 'Capital' : 'PnL'
            ]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="var(--color-green)" 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: 'var(--color-green)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Drawdown Chart
const DrawdownChart = ({ trades, initialCapital }) => {
  const calculateDrawdown = () => {
    const drawdownData = [];
    let currentCapital = parseFloat(initialCapital);
    let peakValue = currentCapital;
    
    trades.forEach((trade, index) => {
      currentCapital += parseFloat(trade.net_pnl || 0);
      
      if (currentCapital > peakValue) {
        peakValue = currentCapital;
      }
      
      const drawdown = peakValue > 0 ? ((peakValue - currentCapital) / peakValue) * 100 : 0;
      
      drawdownData.push({
        trade_id: index + 1,
        drawdown: drawdown,
        date: trade.exit_date ? trade.exit_date.split('T')[0] : `Trade ${index + 1}`,
        capital: currentCapital
      });
    });
    
    return drawdownData;
  };

  const drawdownData = calculateDrawdown();

  return (
    <div className="chart-item drawdown-chart">
      <h4>📉 Drawdown</h4>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={drawdownData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="trade_id" 
            stroke="var(--color-text-secondary)"
            fontSize={12}
          />
          <YAxis 
            stroke="var(--color-text-secondary)"
            fontSize={12}
            tickFormatter={(value) => `${value.toFixed(1)}%`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid #dc3545',
              borderRadius: '8px',
              color: 'var(--color-white)'
            }}
            formatter={(value, name) => [
              `${value.toFixed(2)}%`,
              'Drawdown'
            ]}
            labelFormatter={(label) => `Trade ${label}`}
          />
          <Area 
            type="monotone" 
            dataKey="drawdown" 
            stroke="#dc3545" 
            fill="#dc3545" 
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Trades Chart (P&L per trade)
const TradesChart = ({ trades }) => {
  const tradesData = trades.map((trade, index) => ({
    trade_id: index + 1,
    pnl: parseFloat(trade.net_pnl || 0),
    is_winning: parseFloat(trade.net_pnl || 0) > 0,
    date: trade.exit_date ? trade.exit_date.split('T')[0] : `Trade ${index + 1}`,
    action: trade.action || 'unknown'
  }));

  const CustomBar = (props) => {
    const { fill, payload, ...rest } = props;
    return (
      <Bar 
        {...rest} 
        fill={payload.is_winning ? 'var(--color-green)' : '#dc3545'} 
      />
    );
  };

  return (
    <div className="chart-item trades-chart">
      <h4>💰 P&L per Trade</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={tradesData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="trade_id" 
            stroke="var(--color-text-secondary)"
            fontSize={12}
          />
          <YAxis 
            stroke="var(--color-text-secondary)"
            fontSize={12}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid var(--color-green)',
              borderRadius: '8px',
              color: 'var(--color-white)'
            }}
            formatter={(value, name) => [
              `$${value.toFixed(2)}`,
              'Net P&L'
            ]}
            labelFormatter={(label) => `Trade ${label}`}
          />
          <Bar 
            dataKey="pnl" 
            shape={<CustomBar />}
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Returns Distribution Chart
const ReturnsDistributionChart = ({ trades }) => {
  const calculateDistribution = () => {
    const pnlValues = trades.map(trade => parseFloat(trade.net_pnl || 0));
    if (pnlValues.length === 0) return [];
    
    const minPnl = Math.min(...pnlValues);
    const maxPnl = Math.max(...pnlValues);
    
    if (minPnl === maxPnl) {
      return [{
        range: `${minPnl.toFixed(0)}`,
        center: minPnl,
        count: pnlValues.length
      }];
    }
    
    const binSize = (maxPnl - minPnl) / 10;
    const bins = [];
    
    for (let i = 0; i < 10; i++) {
      const binStart = minPnl + (i * binSize);
      const binEnd = minPnl + ((i + 1) * binSize);
      const binCenter = (binStart + binEnd) / 2;
      
      const count = pnlValues.filter(pnl => 
        pnl >= binStart && pnl < binEnd
      ).length;
      
      bins.push({
        range: `${binStart.toFixed(0)} - ${binEnd.toFixed(0)}`,
        center: binCenter,
        count: count
      });
    }
    
    return bins;
  };

  const distributionData = calculateDistribution();

  return (
    <div className="chart-item distribution-chart">
      <h4>📊 Returns Distribution</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={distributionData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="range" 
            stroke="var(--color-text-secondary)"
            fontSize={10}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="var(--color-text-secondary)"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid var(--color-green)',
              borderRadius: '8px',
              color: 'var(--color-white)'
            }}
            formatter={(value, name) => [value, 'Trades']}
            labelFormatter={(label) => `Range: ${label}`}
          />
          <Bar 
            dataKey="count" 
            fill="var(--color-green)" 
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Monthly Returns Chart
const MonthlyReturnsChart = ({ trades }) => {
  const calculateMonthlyReturns = () => {
    const monthlyData = {};
    
    trades.forEach(trade => {
      if (!trade.exit_date) return;
      
      const month = trade.exit_date.split('T')[0].substring(0, 7); // YYYY-MM
      
      if (!monthlyData[month]) {
        monthlyData[month] = { return: 0, trades: 0 };
      }
      
      monthlyData[month].return += parseFloat(trade.net_pnl || 0);
      monthlyData[month].trades += 1;
    });
    
    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: month,
        return: data.return,
        trades: data.trades,
        is_positive: data.return >= 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const monthlyData = calculateMonthlyReturns();

  const CustomMonthlyBar = (props) => {
    const { fill, payload, ...rest } = props;
    return (
      <Bar 
        {...rest} 
        fill={payload.is_positive ? 'var(--color-green)' : '#dc3545'} 
      />
    );
  };

  return (
    <div className="chart-item monthly-chart">
      <h4>📅 Monthly Returns</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="month" 
            stroke="var(--color-text-secondary)"
            fontSize={12}
          />
          <YAxis 
            stroke="var(--color-text-secondary)"
            fontSize={12}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid var(--color-green)',
              borderRadius: '8px',
              color: 'var(--color-white)'
            }}
            formatter={(value, name) => [
              name === 'return' ? `$${value.toFixed(2)}` : value,
              name === 'return' ? 'Return' : 'Trades'
            ]}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Bar 
            dataKey="return" 
            shape={<CustomMonthlyBar />}
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Win/Loss Chart
const WinLossChart = ({ trades }) => {
  const calculateWinLoss = () => {
    const winningTrades = trades.filter(trade => parseFloat(trade.net_pnl || 0) > 0);
    const losingTrades = trades.filter(trade => parseFloat(trade.net_pnl || 0) < 0);
    const breakEvenTrades = trades.filter(trade => parseFloat(trade.net_pnl || 0) === 0);
    
    return [
      { name: 'Winning', value: winningTrades.length, color: 'var(--color-green)' },
      { name: 'Losing', value: losingTrades.length, color: '#dc3545' },
      { name: 'Break Even', value: breakEvenTrades.length, color: '#6c757d' }
    ];
  };

  const winLossData = calculateWinLoss();

  return (
    <div className="chart-item winloss-chart">
      <h4>🎯 Win/Loss Distribution</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={winLossData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="name" 
            stroke="var(--color-text-secondary)"
            fontSize={12}
          />
          <YAxis 
            stroke="var(--color-text-secondary)"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid var(--color-green)',
              borderRadius: '8px',
              color: 'var(--color-white)'
            }}
            formatter={(value, name) => [value, 'Trades']}
          />
          <Bar 
            dataKey="value" 
            fill={(entry) => entry.color}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BacktestCharts;
