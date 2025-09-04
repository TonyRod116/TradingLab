export const quantConnectTemplates = [
  {
    id: 'vwap-atr',
    name: 'VWAP + ATR Strategy',
    description: 'A momentum strategy using VWAP (Volume Weighted Average Price) and ATR (Average True Range) for entry and exit signals.',
    category: 'Momentum',
    difficulty: 'Intermediate',
    features: [
      'Uses VWAP for trend identification',
      'ATR for volatility-based position sizing',
      'Suitable for intraday trading',
      'Works well with liquid assets'
    ],
    naturalLanguage: 'Trade EUR/USD using VWAP and ATR for the last year on 4-hour timeframe',
    indicators: ['VWAP', 'ATR'],
    timeframe: '4-hour',
    symbols: ['EUR/USD']
  },
  {
    id: 'rsi-mean-reversion',
    name: 'RSI Mean Reversion',
    description: 'A mean reversion strategy using RSI (Relative Strength Index) to identify overbought and oversold conditions.',
    category: 'Mean Reversion',
    difficulty: 'Beginner',
    features: [
      'RSI for overbought/oversold signals',
      'Simple entry and exit rules',
      'Good for range-bound markets',
      'Low complexity implementation'
    ],
    naturalLanguage: 'Create a mean reversion strategy using RSI on SPY with 14-period RSI, buy when RSI < 30, sell when RSI > 70',
    indicators: ['RSI'],
    timeframe: 'Daily',
    symbols: ['SPY']
  },
  {
    id: 'moving-average-crossover',
    name: 'Moving Average Crossover',
    description: 'A trend-following strategy using two moving averages to generate buy and sell signals.',
    category: 'Trend Following',
    difficulty: 'Beginner',
    features: [
      'Fast and slow moving averages',
      'Trend identification',
      'Works well in trending markets',
      'Classic technical analysis approach'
    ],
    naturalLanguage: 'Create a moving average crossover strategy on QQQ with 20-day and 50-day moving averages',
    indicators: ['SMA'],
    timeframe: 'Daily',
    symbols: ['QQQ']
  },
  {
    id: 'bollinger-bands-squeeze',
    name: 'Bollinger Bands Squeeze',
    description: 'A volatility breakout strategy using Bollinger Bands to identify low volatility periods followed by breakouts.',
    category: 'Breakout',
    difficulty: 'Intermediate',
    features: [
      'Bollinger Bands for volatility measurement',
      'Breakout detection',
      'Good for volatile markets',
      'Requires careful risk management'
    ],
    naturalLanguage: 'Create a Bollinger Bands squeeze strategy on BTC/USD with 20-period BB and 2 standard deviations',
    indicators: ['Bollinger Bands'],
    timeframe: '4-hour',
    symbols: ['BTC/USD']
  },
  {
    id: 'macd-momentum',
    name: 'MACD Momentum',
    description: 'A momentum strategy using MACD (Moving Average Convergence Divergence) to identify trend changes and momentum shifts.',
    category: 'Momentum',
    difficulty: 'Intermediate',
    features: [
      'MACD line and signal line crossover',
      'Histogram for momentum strength',
      'Good for trend identification',
      'Works across multiple timeframes'
    ],
    naturalLanguage: 'Create a MACD momentum strategy on AAPL with 12, 26, 9 MACD parameters',
    indicators: ['MACD'],
    timeframe: 'Daily',
    symbols: ['AAPL']
  },
  {
    id: 'stochastic-oscillator',
    name: 'Stochastic Oscillator',
    description: 'A momentum strategy using Stochastic Oscillator to identify overbought and oversold conditions with trend confirmation.',
    category: 'Momentum',
    difficulty: 'Intermediate',
    features: [
      'Stochastic %K and %D lines',
      'Overbought/oversold signals',
      'Trend confirmation',
      'Good for ranging markets'
    ],
    naturalLanguage: 'Create a stochastic oscillator strategy on GLD with 14-period stochastic, buy when %K < 20, sell when %K > 80',
    indicators: ['Stochastic'],
    timeframe: 'Daily',
    symbols: ['GLD']
  }
];

export const getTemplateById = (id) => {
  return quantConnectTemplates.find(template => template.id === id);
};

export const getTemplatesByCategory = (category) => {
  return quantConnectTemplates.filter(template => template.category === category);
};

export const getTemplatesByDifficulty = (difficulty) => {
  return quantConnectTemplates.filter(template => template.difficulty === difficulty);
};
