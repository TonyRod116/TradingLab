import React, { memo, useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import './MiniEquityChart.css';

const MiniEquityChart = memo(({ strategy, height = 60 }) => {
  
  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    // ONLY use real equity curve data from backtests - NO mock data
    if (strategy.equity_curve && strategy.equity_curve.length > 0) {
      return strategy.equity_curve.map((point, index) => ({
        date: index,
        value: parseFloat(point.equity || point.equity_value || 0)
      }));
    }
    
    // If no real equity curve, try to use backtest data
    if (strategy.backtests && strategy.backtests.length > 0) {
      const latestBacktest = strategy.backtests[0];
      if (latestBacktest.equity_curve && latestBacktest.equity_curve.length > 0) {
        return latestBacktest.equity_curve.map((point, index) => ({
          date: index,
          value: parseFloat(point.equity || point.equity_value || 0)
        }));
      }
    }
    
    // NO FALLBACK DATA - if no real equity curve, return empty array
    // This ensures we never show fake data
    return [];
  }, [strategy.equity_curve, strategy.backtests]);

  // Memoize line color calculation
  const lineColor = useMemo(() => {
    const isPositive = (parseFloat(strategy.total_return) || 0) >= 0;
    return isPositive ? '#00ff88' : '#ff6b6b';
  }, [strategy.total_return]);

  // If no real data, show a placeholder message
  if (chartData.length === 0) {
    return (
      <div className="mini-equity-chart" style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#666', fontSize: '12px' }}>No equity data</span>
      </div>
    );
  }

  return (
    <div className="mini-equity-chart" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="1 1" stroke="rgba(255,255,255,0.1)" />
          <XAxis hide />
          <YAxis hide />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

MiniEquityChart.displayName = 'MiniEquityChart';

export default MiniEquityChart;