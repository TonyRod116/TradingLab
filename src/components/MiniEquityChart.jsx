import React from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import './MiniEquityChart.css';

const MiniEquityChart = ({ strategy, height = 60 }) => {
  
  // Si tenemos datos de equity curve del backend, usarlos
  if (strategy.equity_curve && strategy.equity_curve.length > 0) {
    const chartData = strategy.equity_curve.map(point => ({
      date: new Date(point.timestamp).getTime(),
      value: parseFloat(point.equity_value)
    }));

    const isPositive = strategy.total_return >= 0;
    const lineColor = isPositive ? '#00ff88' : '#ff6b6b';

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

  // Fallback: generar datos mock basados en métricas
  const generateMockData = () => {
    const dataPoints = 20;
    const initialValue = parseFloat(strategy.initial_capital) || 100000;
    const totalReturn = parseFloat(strategy.total_return) || 0;
    const finalValue = initialValue + totalReturn;
    
    console.log('Generating mock data:', { initialValue, totalReturn, finalValue });
    
    const data = [];
    for (let i = 0; i < dataPoints; i++) {
      const progress = i / (dataPoints - 1);
      const volatility = 0.05; // Volatilidad fija para el mini chart
      const randomFactor = (Math.random() - 0.5) * volatility;
      
      // Interpolación lineal con algo de ruido
      const value = initialValue + (finalValue - initialValue) * progress + randomFactor * initialValue;
      data.push({
        date: i,
        value: Math.max(value, initialValue * 0.1) // Permitir valores bajos pero no negativos
      });
    }
    
    return data;
  };

  const mockData = generateMockData();
  const isPositive = (parseFloat(strategy.total_return) || 0) >= 0;
  const lineColor = isPositive ? '#00ff88' : '#ff6b6b';
  
  console.log('Mock data generated:', mockData);
  console.log('Line color:', lineColor);

  return (
    <div className="mini-equity-chart" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockData}>
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
};

export default MiniEquityChart;
