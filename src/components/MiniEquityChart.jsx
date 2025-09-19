import React, { memo, useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import './MiniEquityChart.css';

const MiniEquityChart = memo(({ strategy, height = 60 }) => {
  
  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    if (strategy.equity_curve && strategy.equity_curve.length > 0) {
      return strategy.equity_curve.map(point => ({
        date: new Date(point.timestamp).getTime(),
        value: parseFloat(point.equity_value)
      }));
    }
    return null;
  }, [strategy.equity_curve]);

  // Memoize line color calculation
  const lineColor = useMemo(() => {
    const isPositive = strategy.total_return >= 0;
    return isPositive ? '#00ff88' : '#ff6b6b';
  }, [strategy.total_return]);
  
  // If we have equity curve data from backend, use it
  if (chartData) {

    return (
      <div className="mini-equity-chart" style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="1 1" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              type="number" 
              scale="time" 
              domain={['dataMin', 'dataMax']}
              hide
            />
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
  }

  // Use real equity curve data if available, otherwise show a simple line
  const getRealData = () => {
    if (strategy.equity_curve && strategy.equity_curve.length > 0) {
      return strategy.equity_curve.map((point, index) => ({
        date: index,
        value: parseFloat(point.equity || point.equity_value || 0)
      }));
    }
    
    // If no real data, show a simple line based on total return
    const initialValue = parseFloat(strategy.initial_capital) || 100000;
    const totalReturn = parseFloat(strategy.total_return) || 0;
    const finalValue = initialValue + totalReturn;
    
    return [
      { date: 0, value: initialValue },
      { date: 1, value: finalValue }
    ];
  };

  const chartData = getRealData();
  const isPositive = (parseFloat(strategy.total_return) || 0) >= 0;
  const lineColor = isPositive ? '#00ff88' : '#ff6b6b';
  


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
