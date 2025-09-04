// Generador de código LEAN para QuantConnect
export const generateLeanCode = (strategy, backtestParams) => {
  const { rules } = strategy;
  
  // Validar y extraer datos con fallbacks
  const symbols = Array.isArray(rules?.symbols) ? rules.symbols : 
                  Array.isArray(strategy.symbols) ? strategy.symbols :
                  strategy.symbol ? [strategy.symbol] : ['SPY'];
  const timeframe = rules?.timeframe || strategy.timeframe || '1d';
  const entry_conditions = Array.isArray(rules?.entry_conditions) ? rules.entry_conditions :
                          Array.isArray(rules?.entry_rules) ? rules.entry_rules : [];
  const exit_conditions = Array.isArray(rules?.exit_conditions) ? rules.exit_conditions :
                         Array.isArray(rules?.exit_rules) ? rules.exit_rules : [];
  
  const { start_date, end_date, initial_capital } = backtestParams;
  
  // Convertir fechas
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  
  // Convertir timeframe a resolución LEAN
  const resolutionMap = {
    'daily': 'Resolution.Daily',
    'hourly': 'Resolution.Hour',
    'minute': 'Resolution.Minute',
    '1d': 'Resolution.Daily',
    '1h': 'Resolution.Hour',
    '1m': 'Resolution.Minute'
  };
  const resolution = resolutionMap[timeframe] || 'Resolution.Daily';
  
  // Generar indicadores necesarios
  const generateIndicators = () => {
    const indicators = new Set();
    const indicatorCode = [];
    
    // Función para agregar indicador si no existe
    const addIndicator = (name, code) => {
      if (!indicators.has(name)) {
        indicators.add(name);
        indicatorCode.push(code);
      }
    };
    
    // Revisar todas las condiciones (entrada y salida)
    const allConditions = [...entry_conditions, ...exit_conditions];
    
    allConditions.forEach(ruleBlock => {
      if (ruleBlock.conditions && Array.isArray(ruleBlock.conditions)) {
        ruleBlock.conditions.forEach(condition => {
          const { first_value, second_value, exitType, firstValue, secondValue } = condition;
          
          // Verificar firstValue
          const leftValue = first_value || firstValue;
          if (leftValue) {
            if (leftValue.startsWith('sma')) {
              const period = leftValue.replace('sma', '');
              addIndicator(`sma_${period}`, `self.sma_${period} = self.SMA(self.symbol, ${period})`);
            } else if (leftValue.startsWith('ema')) {
              const period = leftValue.replace('ema', '');
              addIndicator(`ema_${period}`, `self.ema_${period} = self.EMA(self.symbol, ${period})`);
            } else if (leftValue.startsWith('rsi')) {
              const period = leftValue.replace('rsi', '');
              addIndicator(`rsi_${period}`, `self.rsi_${period} = self.RSI(self.symbol, ${period})`);
            } else if (leftValue === 'macd') {
              addIndicator('macd', `self.macd = self.MACD(self.symbol, 12, 26, 9)`);
            } else if (leftValue.startsWith('bb_')) {
              addIndicator('bb', `self.bb = self.BB(self.symbol, 20, 2)`);
            } else if (leftValue === 'atr') {
              addIndicator('atr', `self.atr = self.ATR(self.symbol, 14)`);
            } else if (leftValue.startsWith('stoch_')) {
              addIndicator('stoch', `self.stoch = self.STO(self.symbol, 14, 3, 3)`);
            } else if (leftValue === 'williams_r') {
              addIndicator('williams_r', `self.williams_r = self.WILLR(self.symbol, 14)`);
            } else if (leftValue === 'cci') {
              addIndicator('cci', `self.cci = self.CCI(self.symbol, 14)`);
            } else if (leftValue === 'adx') {
              addIndicator('adx', `self.adx = self.ADX(self.symbol, 14)`);
            } else if (leftValue === 'obv') {
              addIndicator('obv', `self.obv = self.OBV(self.symbol)`);
            } else if (leftValue === 'vwap') {
              addIndicator('vwap', `self.vwap = self.VWAP(self.symbol)`);
            }
          }
          
          // Verificar secondValue
          const rightValue = second_value || secondValue;
          if (rightValue) {
            if (rightValue.startsWith('sma')) {
              const period = rightValue.replace('sma', '');
              addIndicator(`sma_${period}`, `self.sma_${period} = self.SMA(self.symbol, ${period})`);
            } else if (rightValue.startsWith('ema')) {
              const period = rightValue.replace('ema', '');
              addIndicator(`ema_${period}`, `self.ema_${period} = self.EMA(self.symbol, ${period})`);
            } else if (rightValue.startsWith('rsi')) {
              const period = rightValue.replace('rsi', '');
              addIndicator(`rsi_${period}`, `self.rsi_${period} = self.RSI(self.symbol, ${period})`);
            } else if (rightValue === 'macd') {
              addIndicator('macd', `self.macd = self.MACD(self.symbol, 12, 26, 9)`);
            } else if (rightValue.startsWith('bb_')) {
              addIndicator('bb', `self.bb = self.BB(self.symbol, 20, 2)`);
            } else if (rightValue === 'atr') {
              addIndicator('atr', `self.atr = self.ATR(self.symbol, 14)`);
            } else if (rightValue.startsWith('stoch_')) {
              addIndicator('stoch', `self.stoch = self.STO(self.symbol, 14, 3, 3)`);
            } else if (rightValue === 'williams_r') {
              addIndicator('williams_r', `self.williams_r = self.WILLR(self.symbol, 14)`);
            } else if (rightValue === 'cci') {
              addIndicator('cci', `self.cci = self.CCI(self.symbol, 14)`);
            } else if (rightValue === 'adx') {
              addIndicator('adx', `self.adx = self.ADX(self.symbol, 14)`);
            } else if (rightValue === 'obv') {
              addIndicator('obv', `self.obv = self.OBV(self.symbol)`);
            } else if (rightValue === 'vwap') {
              addIndicator('vwap', `self.vwap = self.VWAP(self.symbol)`);
            }
          }
          
          // Verificar exitType
          if (exitType === 'atr_based') {
            addIndicator('atr', `self.atr = self.ATR(self.symbol, 14)`);
          } else if (exitType === 'rsi_oversold' || exitType === 'rsi_overbought') {
            addIndicator('rsi_14', `self.rsi_14 = self.RSI(self.symbol, 14)`);
          }
        });
      }
    });
    
    return indicatorCode.length > 0 ? indicatorCode.join('\n        ') : '        # No indicators needed';
  };
  
  // Generar lógica de entrada
  const generateEntryLogic = () => {
    if (!entry_conditions || entry_conditions.length === 0) {
      return '        # No entry conditions defined';
    }
    
    // Procesar cada regla de entrada
    const ruleBlocks = entry_conditions.map((ruleBlock, index) => {
      // Manejar diferentes estructuras de reglas
      let conditions = [];
      
      if (ruleBlock.conditions && Array.isArray(ruleBlock.conditions)) {
        // Estructura: { conditions: [...] }
        conditions = ruleBlock.conditions;
      } else if (Array.isArray(ruleBlock)) {
        // Estructura: [condition1, condition2, ...]
        conditions = ruleBlock;
      } else if (ruleBlock.firstValue || ruleBlock.indicator) {
        // Estructura: { firstValue: ..., operator: ..., ... }
        conditions = [ruleBlock];
      } else {
        return 'False';
      }
      
      const conditionCodes = conditions.map((condition, condIndex) => {
        
        const { first_value, operator, second_value, value, indicator, firstValue, secondValue } = condition;
        let conditionCode = '';
        
        // Mapear operadores
        const operatorMap = {
          'greater_than': '>',
          'less_than': '<',
          'greater_equal': '>=',
          'less_equal': '<=',
          'equal': '==',
          'not_equal': '!='
        };
        
        const op = operatorMap[operator] || operator;
        
        // Determinar el lado izquierdo de la condición
        let leftSide = '';
        const leftValue = first_value || firstValue || indicator;
        
        if (leftValue === 'close' || leftValue === 'price' || leftValue === 'Close') {
          leftSide = 'current_price';
        } else if (leftValue === 'open' || leftValue === 'Open') {
          leftSide = 'data.Bars[self.symbol].Open';
        } else if (leftValue === 'high' || leftValue === 'High') {
          leftSide = 'data.Bars[self.symbol].High';
        } else if (leftValue === 'low' || leftValue === 'Low') {
          leftSide = 'data.Bars[self.symbol].Low';
        } else if (leftValue && leftValue.startsWith('sma')) {
          const period = leftValue.replace('sma', '');
          leftSide = `self.sma_${period}.Current.Value`;
        } else if (leftValue && leftValue.startsWith('ema')) {
          const period = leftValue.replace('ema', '');
          leftSide = `self.ema_${period}.Current.Value`;
        } else if (leftValue && leftValue.startsWith('rsi')) {
          const period = leftValue.replace('rsi', '');
          leftSide = `self.rsi_${period}.Current.Value`;
        } else if (leftValue === 'macd') {
          leftSide = 'self.macd.Current.Value';
        } else if (leftValue === 'bb_upper') {
          leftSide = 'self.bb.UpperBand.Current.Value';
        } else if (leftValue === 'bb_middle') {
          leftSide = 'self.bb.MiddleBand.Current.Value';
        } else if (leftValue === 'bb_lower') {
          leftSide = 'self.bb.LowerBand.Current.Value';
        } else if (leftValue === 'atr') {
          leftSide = 'self.atr.Current.Value';
        } else if (leftValue === 'stoch_k') {
          leftSide = 'self.stoch.K.Current.Value';
        } else if (leftValue === 'stoch_d') {
          leftSide = 'self.stoch.D.Current.Value';
        } else if (leftValue === 'williams_r') {
          leftSide = 'self.williams_r.Current.Value';
        } else if (leftValue === 'cci') {
          leftSide = 'self.cci.Current.Value';
        } else if (leftValue === 'adx') {
          leftSide = 'self.adx.Current.Value';
        } else if (leftValue === 'obv') {
          leftSide = 'self.obv.Current.Value';
        } else if (leftValue === 'vwap') {
          leftSide = 'self.vwap.Current.Value';
        } else {
          leftSide = 'current_price';
        }
        
        // Determinar el lado derecho de la condición
        let rightSide = '';
        const rightValue = second_value || secondValue;
        if (rightValue) {
          if (rightValue === 'close' || rightValue === 'price' || rightValue === 'Close') {
            rightSide = 'current_price';
          } else if (rightValue === 'open' || rightValue === 'Open') {
            rightSide = 'data.Bars[self.symbol].Open';
          } else if (rightValue === 'high' || rightValue === 'High') {
            rightSide = 'data.Bars[self.symbol].High';
          } else if (rightValue === 'low' || rightValue === 'Low') {
            rightSide = 'data.Bars[self.symbol].Low';
          } else if (rightValue && rightValue.startsWith('sma')) {
            const period = rightValue.replace('sma', '');
            rightSide = `self.sma_${period}.Current.Value`;
          } else if (rightValue && rightValue.startsWith('ema')) {
            const period = rightValue.replace('ema', '');
            rightSide = `self.ema_${period}.Current.Value`;
          } else if (rightValue && rightValue.startsWith('rsi')) {
            const period = rightValue.replace('rsi', '');
            rightSide = `self.rsi_${period}.Current.Value`;
          } else if (rightValue === 'macd') {
            rightSide = 'self.macd.Current.Value';
          } else if (rightValue === 'bb_upper') {
            rightSide = 'self.bb.UpperBand.Current.Value';
          } else if (rightValue === 'bb_middle') {
            rightSide = 'self.bb.MiddleBand.Current.Value';
          } else if (rightValue === 'bb_lower') {
            rightSide = 'self.bb.LowerBand.Current.Value';
          } else if (rightValue === 'atr') {
            rightSide = 'self.atr.Current.Value';
          } else if (rightValue === 'stoch_k') {
            rightSide = 'self.stoch.K.Current.Value';
          } else if (rightValue === 'stoch_d') {
            rightSide = 'self.stoch.D.Current.Value';
          } else if (rightValue === 'williams_r') {
            rightSide = 'self.williams_r.Current.Value';
          } else if (rightValue === 'cci') {
            rightSide = 'self.cci.Current.Value';
          } else if (rightValue === 'adx') {
            rightSide = 'self.adx.Current.Value';
          } else if (rightValue === 'obv') {
            rightSide = 'self.obv.Current.Value';
          } else if (rightValue === 'vwap') {
            rightSide = 'self.vwap.Current.Value';
          } else {
            rightSide = rightValue;
          }
        } else if (value !== undefined) {
          rightSide = value;
        } else {
          rightSide = '0';
        }
        
        conditionCode = `${leftSide} ${op} ${rightSide}`;
        return conditionCode;
      });
      
      const logicOperator = ruleBlock.logic_operator || 'and';
      const pythonOperator = logicOperator.toLowerCase() === 'and' ? 'and' : 'or';
      const result = `(${conditionCodes.join(` ${pythonOperator} `)})`;
      return result;
    });
    
    const combinedLogicOperator = rules.entry_logic_operator || 'and';
    const pythonCombinedOperator = combinedLogicOperator.toLowerCase() === 'and' ? 'and' : 'or';
    const combinedConditions = ruleBlocks.join(` ${pythonCombinedOperator} `);
    
    const holdingDirection = rules.direction === 'Long (Buy)' ? '1.0' : '-1.0';
    
    return `        # Entry conditions
        if not self.is_in_position and (${combinedConditions}):
            self.SetHoldings(self.symbol, ${holdingDirection})
            self.is_in_position = True
            self.entry_price = current_price`;
  };
  
  // Generar lógica de salida
  const generateExitLogic = () => {
    if (!exit_conditions || exit_conditions.length === 0) {
      return '        # No exit conditions defined';
    }
    
    // Procesar cada regla de salida
    const ruleBlocks = exit_conditions.map(ruleBlock => {
      if (!ruleBlock.conditions || !Array.isArray(ruleBlock.conditions)) {
        return 'False';
      }
      
      const conditions = ruleBlock.conditions.map(condition => {
        const { exitType, operator, value, firstValue, secondValue } = condition;
        let conditionCode = '';
        
        // Mapear operadores
        const operatorMap = {
          'greater_than': '>',
          'less_than': '<',
          'greater_equal': '>=',
          'less_equal': '<=',
          'equal': '==',
          'not_equal': '!='
        };
        
        const op = operatorMap[operator] || operator;
        
        switch (exitType) {
          case 'percentage':
            const percentageValue = (value / 100).toFixed(4);
            conditionCode = `abs(current_price - self.entry_price) / self.entry_price ${op} ${percentageValue}`;
            break;
          case 'atr_based':
            conditionCode = `self.atr.Current.Value ${op} ${value}`;
            break;
          case 'points':
            conditionCode = `abs(current_price - self.entry_price) ${op} ${value}`;
            break;
          case 'rsi_oversold':
            conditionCode = `self.rsi_14.Current.Value ${op} 30`;
            break;
          case 'rsi_overbought':
            conditionCode = `self.rsi_14.Current.Value ${op} 70`;
            break;
          case 'sma_cross':
            if (firstValue && firstValue.startsWith('sma_') && secondValue && secondValue.startsWith('sma_')) {
              const period1 = firstValue.split('_')[1];
              const period2 = secondValue.split('_')[1];
              conditionCode = `self.sma_${period1}.Current.Value ${op} self.sma_${period2}.Current.Value`;
            } else {
              conditionCode = 'False';
            }
            break;
          case 'price_cross':
            if (firstValue === 'close' || firstValue === 'price') {
              if (secondValue && secondValue.startsWith('sma_')) {
                const period = secondValue.split('_')[1];
                conditionCode = `current_price ${op} self.sma_${period}.Current.Value`;
              } else if (secondValue && secondValue.startsWith('ema_')) {
                const period = secondValue.split('_')[1];
                conditionCode = `current_price ${op} self.ema_${period}.Current.Value`;
              } else {
                conditionCode = `current_price ${op} ${value}`;
              }
            } else {
              conditionCode = 'False';
            }
            break;
          default:
            conditionCode = `current_price ${op} ${value}`;
        }
        
        return conditionCode;
      });
      
      const logicOperator = ruleBlock.logic_operator || 'and';
      const pythonOperator = logicOperator.toLowerCase() === 'and' ? 'and' : 'or';
      return `(${conditions.join(` ${pythonOperator} `)})`;
    });
    
    const combinedLogicOperator = rules.exit_logic_operator || 'and';
    const pythonCombinedOperator = combinedLogicOperator.toLowerCase() === 'and' ? 'and' : 'or';
    const combinedConditions = ruleBlocks.join(` ${pythonCombinedOperator} `);
    
    return `        # Exit conditions
        elif self.is_in_position and (${combinedConditions}):
            self.Liquidate(self.symbol)
            self.is_in_position = False`;
  };
  
  // Generar código LEAN completo
  const leanCode = `from AlgorithmImports import *
from datetime import datetime, timedelta

class TradingStrategy(QCAlgorithm):
    def Initialize(self):
        # Set dates
        self.SetStartDate(DateTime(${startDate.getFullYear()}, ${startDate.getMonth() + 1}, ${startDate.getDate()}))
        self.SetEndDate(DateTime(${endDate.getFullYear()}, ${endDate.getMonth() + 1}, ${endDate.getDate()}))
        
        # Set cash
        self.SetCash(${initial_capital})
        
        # Set benchmark
        self.SetBenchmark("SPY")
        
        # Add symbols
        ${symbols.map(symbol => `self.symbol = self.AddEquity("${symbol}", ${resolution}).Symbol`).join('\n        ')}
        
        # Initialize indicators
        ${generateIndicators()}
        
        # Position tracking
        self.is_in_position = False
        self.entry_price = 0
    
    def OnData(self, data):
        if not data.Bars.ContainsKey(self.symbol):
            return
        
        current_price = data.Bars[self.symbol].Close
        
        # Entry logic
        ${generateEntryLogic()}
        
        # Exit logic
        ${generateExitLogic()}`;
      
  return leanCode;
};
