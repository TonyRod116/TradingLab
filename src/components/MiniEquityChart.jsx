import React, { memo, useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import './MiniEquityChart.css';

const MiniEquityChart = memo(({ strategy, height = 60 }) => {
  
  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    // ONLY use real equity curve data from backtests - NO mock data
    if (strategy.equity_curve && strategy.equity_curve.length > 0) {
      const equityData = strategy.equity_curve.map((point, index) => ({
        date: index,
        value: parseFloat(point.equity || 0)
      }));
      
      // Check if all equity values are zero
      const hasNonZeroData = equityData.some(point => point.value !== 0);
      
      if (hasNonZeroData) {
        return equityData;
      }
    }
    
    // If no real equity curve, try to use backtest data
    if (strategy.backtests && strategy.backtests.length > 0) {
      const latestBacktest = strategy.backtests[0];
      if (latestBacktest.equity_curve && latestBacktest.equity_curve.length > 0) {
        const equityData = latestBacktest.equity_curve.map((point, index) => ({
          date: index,
          value: parseFloat(point.equity || 0)
        }));
        
        // Check if all equity values are zero
        const hasNonZeroData = equityData.some(point => point.value !== 0);
        
        if (hasNonZeroData) {
          return equityData;
        }
      }
    }
    
    // If all equity data is zero, generate a simple line based on total return
    const initialCapital = parseFloat(strategy.initial_capital) || 100000;
    const totalReturn = parseFloat(strategy.total_return) || 0;
    const finalValue = initialCapital + totalReturn;
    
    return [
      { date: 0, value: initialCapital },
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