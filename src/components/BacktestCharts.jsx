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

const BacktestCharts = ({ backtestData: propBacktestData, trades: propTrades, equityCurve: propEquityCurve }) => {
  // Use props directly, no API calls to prevent freezing
  const backtestData = propBacktestData;
  const trades = propTrades || [];
  const equityCurve = propEquityCurve || [];

  // No loading or error states needed since we're using props directly

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

  // Simple debug log
  console.log('BacktestCharts rendering with trades:', trades?.length || 0);

  return (
    <div className="backtest-charts">
      <div className="charts-header">
        <h3>📊 Backtest Analysis Charts</h3>
        <p>Comprehensive visual analysis of your strategy performance</p>
      </div>
      
      <div className="chart-grid">
        <EquityCurveChart 
          trades={trades} 
          equityCurve={equityCurve}
          initialCapital={backtestData.initial_capital}
          startDate={backtestData.start_date}
          endDate={backtestData.end_date}
        />
        
        <TradesChart trades={trades} />
        
        <WinLossChart trades={trades} />
      </div>
    </div>
  );
};

// Equity Curve Chart
const EquityCurveChart = ({ trades, equityCurve, initialCapital, startDate, endDate }) => {
  const calculateEquityCurve = () => {
    // Simplified calculation to prevent freezing
    if (!trades || trades.length === 0) return [];
    
    const equityData = [];
    let currentCapital = parseFloat(initialCapital || 10000);
    
    // Simple calculation: just show cumulative P&L per trade
    trades.forEach((trade, index) => {
      currentCapital += parseFloat(trade.net_pnl || 0);
      equityData.push({
        trade: index + 1,
        value: currentCapital,
        pnl: parseFloat(trade.net_pnl || 0)
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
            dataKey="trade" 
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
            labelFormatter={(label) => `Trade: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="var(--color-green)" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: 'var(--color-green)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Drawdown Chart
const DrawdownChart = ({ trades, equityCurve, initialCapital }) => {
  const calculateDrawdown = () => {
    // Si tenemos datos reales de equity curve del backend, usarlos
    if (equityCurve && equityCurve.length > 0) {
      return equityCurve.map((point, index) => ({
        trade_id: index + 1,
        drawdown: parseFloat(point.drawdown || 0),
        date: new Date(point.timestamp).toISOString().split('T')[0],
        capital: parseFloat(point.equity_value)
      }));
    }
    
    // Fallback: calcular desde trades si no hay datos de equity curve
    const drawdownData = [];
    let currentCapital = parseFloat(initialCapital || 10000);
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
  // Limit to first 50 trades to prevent performance issues
  const limitedTrades = trades.slice(0, 50);
  
  const tradesData = limitedTrades.map((trade, index) => ({
    trade_id: index + 1,
    pnl: parseFloat(trade.net_pnl || 0),
    is_winning: parseFloat(trade.net_pnl || 0) > 0
  }));

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
            fill="var(--color-green)"
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
    // Limit to first 100 trades for performance
    const limitedTrades = trades.slice(0, 100);
    
    const winningTrades = limitedTrades.filter(trade => parseFloat(trade.net_pnl || 0) > 0);
    const losingTrades = limitedTrades.filter(trade => parseFloat(trade.net_pnl || 0) < 0);
    const breakEvenTrades = limitedTrades.filter(trade => parseFloat(trade.net_pnl || 0) === 0);
    
    return [
      { name: 'Winning', value: winningTrades.length },
      { name: 'Losing', value: losingTrades.length },
      { name: 'Break Even', value: breakEvenTrades.length }
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
            fill="var(--color-green)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BacktestCharts;
