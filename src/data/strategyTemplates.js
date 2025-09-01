// Pre-defined strategy templates
export const strategyTemplates = [
  {
    id: 'rsi_mean_reversion',
    name: 'RSI Mean Reversion',
    description: 'Buy when RSI is oversold, sell when overbought',
    features: ['RSI Oversold/Overbought', 'Moving Average Filter', 'Risk Management'],
    entryRules: [
      {
        name: 'RSI Oversold Entry',
        rule_type: 'condition',
        conditions: [
          {
            left_operand: 'rsi',
            operator: 'lt',
            right_operand: 'rsi_30',
            logical_operator: 'and'
          },
          {
            left_operand: 'close',
            operator: 'gt',
            right_operand: 'sma_20',
            logical_operator: 'and'
          }
        ]
      }
    ],
    exitRules: [
      {
        name: 'RSI Overbought Exit',
        rule_type: 'condition',
        conditions: [
          {
            left_operand: 'rsi',
            operator: 'gt',
            right_operand: 'rsi_70',
            logical_operator: 'or'
          },
          {
            left_operand: 'close',
            operator: 'lt',
            right_operand: 'sma_20',
            logical_operator: 'or'
          }
        ]
      }
    ]
  },
  {
    id: 'moving_average_crossover',
    name: 'Moving Average Crossover',
    description: 'Buy when fast MA crosses above slow MA, sell on reverse',
    features: ['EMA Crossover', 'VWAP Confirmation', 'Trend Following'],
    entryRules: [
      {
        name: 'Golden Cross Entry',
        rule_type: 'condition',
        conditions: [
          {
            left_operand: 'ema_20',
            operator: 'cross_up',
            right_operand: 'ema_50',
            logical_operator: 'and'
          },
          {
            left_operand: 'close',
            operator: 'gt',
            right_operand: 'vwap',
            logical_operator: 'and'
          }
        ]
      }
    ],
    exitRules: [
      {
        name: 'Death Cross Exit',
        rule_type: 'condition',
        conditions: [
          {
            left_operand: 'ema_20',
            operator: 'cross_down',
            right_operand: 'ema_50',
            logical_operator: 'or'
          },
          {
            left_operand: 'close',
            operator: 'lt',
            right_operand: 'vwap',
            logical_operator: 'or'
          }
        ]
      }
    ]
  },
  {
    id: 'vwap_bounce',
    name: 'VWAP Bounce Strategy',
    description: 'Trade bounces off VWAP levels with volume confirmation',
    features: ['VWAP Levels', 'Volume Confirmation', 'Mean Reversion'],
    entryRules: [
      {
        name: 'VWAP Bounce Entry',
        rule_type: 'condition',
        conditions: [
          {
            left_operand: 'close',
            operator: 'gt',
            right_operand: 'vwap_minus_0_5',
            logical_operator: 'and'
          },
          {
            left_operand: 'close',
            operator: 'lt',
            right_operand: 'vwap',
            logical_operator: 'and'
          },
          {
            left_operand: 'volume',
            operator: 'gt',
            right_operand: 'volume',
            logical_operator: 'and'
          }
        ]
      }
    ],
    exitRules: [
      {
        name: 'VWAP Target Exit',
        rule_type: 'condition',
        conditions: [
          {
            left_operand: 'close',
            operator: 'gt',
            right_operand: 'vwap_plus_1_0',
            logical_operator: 'or'
          },
          {
            left_operand: 'close',
            operator: 'lt',
            right_operand: 'vwap_minus_1_0',
            logical_operator: 'or'
          }
        ]
      }
    ]
  },
  {
    id: 'bollinger_bands_squeeze',
    name: 'Bollinger Bands Squeeze',
    description: 'Trade breakouts from low volatility periods',
    features: ['Bollinger Bands', 'Volume Breakout', 'Volatility Squeeze'],
    entryRules: [
      {
        name: 'Breakout Entry',
        rule_type: 'condition',
        conditions: [
          {
            left_operand: 'close',
            operator: 'gt',
            right_operand: 'bb_upper',
            logical_operator: 'and'
          },
          {
            left_operand: 'volume',
            operator: 'gt',
            right_operand: 'volume',
            logical_operator: 'and'
          }
        ]
      }
    ],
    exitRules: [
      {
        name: 'Reversal Exit',
        rule_type: 'condition',
        conditions: [
          {
            left_operand: 'close',
            operator: 'lt',
            right_operand: 'bb_middle',
            logical_operator: 'or'
          },
          {
            left_operand: 'rsi',
            operator: 'gt',
            right_operand: 'rsi_80',
            logical_operator: 'or'
          }
        ]
      }
    ]
  },
  {
    id: 'macd_momentum',
    name: 'MACD Momentum',
    description: 'Follow momentum with MACD signal confirmation',
    features: ['MACD Signal', 'Momentum Confirmation', 'Histogram Analysis'],
    entryRules: [
      {
        name: 'MACD Bullish Entry',
        rule_type: 'condition',
        conditions: [
          {
            left_operand: 'macd',
            operator: 'gt',
            right_operand: 'macd_signal',
            logical_operator: 'and'
          },
          {
            left_operand: 'macd_histogram',
            operator: 'gt',
            right_operand: '0',
            logical_operator: 'and'
          }
        ]
      }
    ],
    exitRules: [
      {
        name: 'MACD Bearish Exit',
        rule_type: 'condition',
        conditions: [
          {
            left_operand: 'macd',
            operator: 'lt',
            right_operand: 'macd_signal',
            logical_operator: 'or'
          },
          {
            left_operand: 'macd_histogram',
            operator: 'lt',
            right_operand: '0',
            logical_operator: 'or'
          }
        ]
      }
    ]
  }
];

// Helper functions for template data

export const getTemplateById = (id) => {
  return strategyTemplates.find(template => template.id === id);
};


