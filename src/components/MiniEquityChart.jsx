import React, { memo, useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import './MiniEquityChart.css';

const MiniEquityChart = memo(({ strategy, height = 60 }) => {
  
  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    // First try to use real equity curve data if available
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
    
    // If no real data, create a simple line based on total return
    // This matches exactly what Community Backtests shows
    const initialValue = parseFloat(strategy.initial_capital) || 100000;
    const totalReturn = parseFloat(strategy.total_return) || 0;
    const finalValue = initialValue + totalReturn;
    
    // Create a simple 2-point line: start and end
    return [
      { date: 0, value: initialValue },
      { date: 1, value: finalValue }
    ];
  }, [strategy.equity_curve, strategy.backtests, strategy.initial_capital, strategy.total_return]);

  // Memoize line color calculation
  const lineColor = useMemo(() => {
    const isPositive = (parseFloat(strategy.total_return) || 0) >= 0;
    return isPositive ? '#00ff88' : '#ff6b6b';
  }, [strategy.total_return]);

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