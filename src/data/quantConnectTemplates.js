export const quantConnectTemplates = [
  {
    id: 'sp500-buy-hold-2025',
    name: 'S&P 500 Buy & Hold 2025',
    description: 'Super simple strategy: buy SPY at the beginning of 2025 and hold until September. Perfect for testing the integration.',
    category: 'Buy & Hold',
    difficulty: 'Beginner',
    features: [
      'Buy and hold strategy',
      'No technical indicators',
      'Perfect for testing',
      'Minimal risk'
    ],
    naturalLanguage: 'Buy SPY on January 1, 2025 and hold until September 1, 2025',
    indicators: [],
    timeframe: 'Daily',
    symbols: ['SPY'],
    pythonCode: `from AlgorithmImports import *

class SP500BuyHold2025(QCAlgorithm):
    def Initialize(self):
        # Set specific dates
        self.SetStartDate(2025, 1, 1)
        self.SetEndDate(2025, 9, 1)
        self.SetCash(100000)
        
        # Add SPY
        self.spy = self.AddEquity("SPY", Resolution.Daily).Symbol
        
        # Flag to control the purchase
        self.bought = False
        
        # Initialization log
        self.Debug("SP500 Buy & Hold 2025 Strategy Initialized")
    
    def OnData(self, data):
        # Buy SPY only once at the beginning
        if not self.bought and data.ContainsKey(self.spy):
            self.SetHoldings(self.spy, 1.0)  # 100% of capital in SPY
            self.bought = True
            self.Debug(f"Bought SPY at {data[self.spy].Price} on {self.Time}")
    
    def OnEndOfAlgorithm(self):
        self.Debug("SP500 Buy & Hold 2025 Strategy Completed")`
  },
  {
    id: 'rsi-mean-reversion-spy',
    name: 'RSI Mean Reversion SPY',
    description: 'Mean reversion strategy using RSI on SPY. Buy when RSI < 30, sell when RSI > 70.',
    category: 'Mean Reversion',
    difficulty: 'Beginner',
    features: [
      '14-period RSI',
      'Clear buy/sell signals',
      'Ideal for sideways markets',
      'Easy to understand'
    ],
    naturalLanguage: 'RSI strategy on SPY: buy when RSI < 30, sell when RSI > 70',
    indicators: ['RSI'],
    timeframe: 'Daily',
    symbols: ['SPY'],
    pythonCode: `from AlgorithmImports import *

class RSIMeanReversionSPY(QCAlgorithm):
    def Initialize(self):
        self.SetStartDate(2024, 1, 1)
        self.SetEndDate(2024, 12, 31)
        self.SetCash(100000)
        
        # Agregar SPY
        self.spy = self.AddEquity("SPY", Resolution.Daily).Symbol
        
        # Configurar RSI
        self.rsi = self.RSI(self.spy, 14, MovingAverageType.Simple)
        
        # Período de calentamiento
        self.SetWarmUp(20)
        
        # Bandera de posición
        self.is_invested = False
        
        self.Debug("RSI Mean Reversion SPY Strategy Initialized")
    
    def OnData(self, data):
        if self.IsWarmingUp or not data.ContainsKey(self.spy):
            return
        
        # Obtener valor actual del RSI
        rsi_value = self.rsi.Current.Value
        
        # Señal de compra: RSI < 30 y no estamos invertidos
        if rsi_value < 30 and not self.is_invested:
            self.SetHoldings(self.spy, 1.0)
            self.is_invested = True
            self.Debug(f"Bought SPY at {data[self.spy].Price}, RSI: {rsi_value:.2f}")
        
        # Señal de venta: RSI > 70 y estamos invertidos
        elif rsi_value > 70 and self.is_invested:
            self.Liquidate(self.spy)
            self.is_invested = False
            self.Debug(f"Sold SPY at {data[self.spy].Price}, RSI: {rsi_value:.2f}")
    
    def OnEndOfAlgorithm(self):
        self.Debug("RSI Mean Reversion SPY Strategy Completed")`
  },
  {
    id: 'sma-crossover-qqq',
    name: 'SMA Crossover QQQ',
    description: 'Moving average crossover strategy on QQQ. Buy when SMA 20 crosses above SMA 50.',
    category: 'Trend Following',
    difficulty: 'Beginner',
    features: [
      'SMA 20 and SMA 50',
      'Clear trend signals',
      'Ideal for trending markets',
      'Proven classic strategy'
    ],
    naturalLanguage: 'Moving average crossover strategy on QQQ: SMA 20 crosses SMA 50',
    indicators: ['SMA'],
    timeframe: 'Daily',
    symbols: ['QQQ'],
    pythonCode: `from AlgorithmImports import *

class SMACrossoverQQQ(QCAlgorithm):
    def Initialize(self):
        self.SetStartDate(2024, 1, 1)
        self.SetEndDate(2024, 12, 31)
        self.SetCash(100000)
        
        # Agregar QQQ
        self.qqq = self.AddEquity("QQQ", Resolution.Daily).Symbol
        
        # Configurar medias móviles
        self.sma_fast = self.SMA(self.qqq, 20)
        self.sma_slow = self.SMA(self.qqq, 50)
        
        # Período de calentamiento
        self.SetWarmUp(60)
        
        # Bandera de posición
        self.is_invested = False
        
        self.Debug("SMA Crossover QQQ Strategy Initialized")
    
    def OnData(self, data):
        if self.IsWarmingUp or not data.ContainsKey(self.qqq):
            return
        
        # Obtener valores de las medias móviles
        fast_value = self.sma_fast.Current.Value
        slow_value = self.sma_slow.Current.Value
        
        # Señal de compra: SMA rápida cruza por encima de SMA lenta
        if fast_value > slow_value and not self.is_invested:
            self.SetHoldings(self.qqq, 1.0)
            self.is_invested = True
            self.Debug(f"Bought QQQ at {data[self.qqq].Price}, SMA20: {fast_value:.2f}, SMA50: {slow_value:.2f}")
        
        # Señal de venta: SMA rápida cruza por debajo de SMA lenta
        elif fast_value < slow_value and self.is_invested:
            self.Liquidate(self.qqq)
            self.is_invested = False
            self.Debug(f"Sold QQQ at {data[self.qqq].Price}, SMA20: {fast_value:.2f}, SMA50: {slow_value:.2f}")
    
    def OnEndOfAlgorithm(self):
        self.Debug("SMA Crossover QQQ Strategy Completed")`
  },
  {
    id: 'bollinger-bands-aapl',
    name: 'Bollinger Bands AAPL',
    description: 'Bollinger Bands strategy on AAPL. Buy at lower band, sell at upper band.',
    category: 'Mean Reversion',
    difficulty: 'Intermediate',
    features: [
      '20-period Bollinger Bands',
      '2 standard deviations',
      'Ideal for volatile markets',
      'Integrated risk management'
    ],
    naturalLanguage: 'Bollinger Bands strategy on AAPL: buy at lower band, sell at upper band',
    indicators: ['Bollinger Bands'],
    timeframe: 'Daily',
    symbols: ['AAPL'],
    pythonCode: `from AlgorithmImports import *

class BollingerBandsAAPL(QCAlgorithm):
    def Initialize(self):
        self.SetStartDate(2024, 1, 1)
        self.SetEndDate(2024, 12, 31)
        self.SetCash(100000)
        
        # Agregar AAPL
        self.aapl = self.AddEquity("AAPL", Resolution.Daily).Symbol
        
        # Configurar Bandas de Bollinger
        self.bb = self.BB(self.aapl, 20, 2, MovingAverageType.Simple)
        
        # Período de calentamiento
        self.SetWarmUp(25)
        
        # Bandera de posición
        self.is_invested = False
        
        self.Debug("Bollinger Bands AAPL Strategy Initialized")
    
    def OnData(self, data):
        if self.IsWarmingUp or not data.ContainsKey(self.aapl):
            return
        
        # Obtener precio actual y valores de las bandas
        current_price = data[self.aapl].Price
        upper_band = self.bb.UpperBand.Current.Value
        lower_band = self.bb.LowerBand.Current.Value
        middle_band = self.bb.MiddleBand.Current.Value
        
        # Señal de compra: precio toca banda inferior
        if current_price <= lower_band and not self.is_invested:
            self.SetHoldings(self.aapl, 1.0)
            self.is_invested = True
            self.Debug(f"Bought AAPL at {current_price:.2f}, Lower Band: {lower_band:.2f}")
        
        # Señal de venta: precio toca banda superior
        elif current_price >= upper_band and self.is_invested:
            self.Liquidate(self.aapl)
            self.is_invested = False
            self.Debug(f"Sold AAPL at {current_price:.2f}, Upper Band: {upper_band:.2f}")
    
    def OnEndOfAlgorithm(self):
        self.Debug("Bollinger Bands AAPL Strategy Completed")`
  },
  {
    id: 'macd-momentum-tsla',
    name: 'MACD Momentum TSLA',
    description: 'Momentum strategy using MACD on TSLA. Buy when MACD crosses above the signal line.',
    category: 'Momentum',
    difficulty: 'Intermediate',
    features: [
      'MACD 12, 26, 9',
      'Momentum signals',
      'Ideal for volatile stocks',
      'Trend confirmation'
    ],
    naturalLanguage: 'MACD strategy on TSLA: buy when MACD crosses above the signal line',
    indicators: ['MACD'],
    timeframe: 'Daily',
    symbols: ['TSLA'],
    pythonCode: `from AlgorithmImports import *

class MACDMomentumTSLA(QCAlgorithm):
    def Initialize(self):
        self.SetStartDate(2024, 1, 1)
        self.SetEndDate(2024, 12, 31)
        self.SetCash(100000)
        
        # Agregar TSLA
        self.tsla = self.AddEquity("TSLA", Resolution.Daily).Symbol
        
        # Configurar MACD
        self.macd = self.MACD(self.tsla, 12, 26, 9, MovingAverageType.Exponential)
        
        # Período de calentamiento
        self.SetWarmUp(30)
        
        # Bandera de posición
        self.is_invested = False
        
        # Variables para detectar cruces
        self.previous_macd = None
        self.previous_signal = None
        
        self.Debug("MACD Momentum TSLA Strategy Initialized")
    
    def OnData(self, data):
        if self.IsWarmingUp or not data.ContainsKey(self.tsla):
            return
        
        # Obtener valores actuales de MACD
        current_macd = self.macd.Current.Value
        current_signal = self.macd.Signal.Current.Value
        
        # Verificar si tenemos datos previos
        if self.previous_macd is not None and self.previous_signal is not None:
            # Señal de compra: MACD cruza por encima de la señal
            if (self.previous_macd <= self.previous_signal and 
                current_macd > current_signal and 
                not self.is_invested):
                self.SetHoldings(self.tsla, 1.0)
                self.is_invested = True
                self.Debug(f"Bought TSLA at {data[self.tsla].Price}, MACD: {current_macd:.4f}, Signal: {current_signal:.4f}")
            
            # Señal de venta: MACD cruza por debajo de la señal
            elif (self.previous_macd >= self.previous_signal and 
                  current_macd < current_signal and 
                  self.is_invested):
                self.Liquidate(self.tsla)
                self.is_invested = False
                self.Debug(f"Sold TSLA at {data[self.tsla].Price}, MACD: {current_macd:.4f}, Signal: {current_signal:.4f}")
        
        # Guardar valores para la siguiente iteración
        self.previous_macd = current_macd
        self.previous_signal = current_signal
    
    def OnEndOfAlgorithm(self):
        self.Debug("MACD Momentum TSLA Strategy Completed")`
  },
  {
    id: 'multi-asset-rotation',
    name: 'Multi-Asset Rotation',
    description: 'Rotation strategy between SPY, QQQ and TLT based on 3-month momentum. Rotates to the best performing asset.',
    category: 'Rotation',
    difficulty: 'Advanced',
    features: [
      'Rotation between 3 assets',
      '3-month momentum',
      'Automatic diversification',
      'Monthly rebalancing'
    ],
    naturalLanguage: 'Rotation strategy between SPY, QQQ and TLT based on 3-month momentum',
    indicators: ['SMA'],
    timeframe: 'Daily',
    symbols: ['SPY', 'QQQ', 'TLT'],
    pythonCode: `from AlgorithmImports import *

class MultiAssetRotation(QCAlgorithm):
    def Initialize(self):
        self.SetStartDate(2024, 1, 1)
        self.SetEndDate(2024, 12, 31)
        self.SetCash(100000)
        
        # Agregar activos
        self.spy = self.AddEquity("SPY", Resolution.Daily).Symbol
        self.qqq = self.AddEquity("QQQ", Resolution.Daily).Symbol
        self.tlt = self.AddEquity("TLT", Resolution.Daily).Symbol
        
        # Lista de activos
        self.assets = [self.spy, self.qqq, self.tlt]
        
        # Configurar medias móviles para momentum (3 meses = ~63 días)
        self.momentum_period = 63
        self.momentum_indicators = {}
        
        for asset in self.assets:
            self.momentum_indicators[asset] = self.SMA(asset, self.momentum_period)
        
        # Período de calentamiento
        self.SetWarmUp(70)
        
        # Rebalanceo mensual
        self.Schedule.On(self.DateRules.MonthStart(), 
                        self.TimeRules.AfterMarketOpen(self.spy, 30), 
                        self.Rebalance)
        
        # Activo actual
        self.current_asset = None
        
        self.Debug("Multi-Asset Rotation Strategy Initialized")
    
    def Rebalance(self):
        if self.IsWarmingUp:
            return
        
        # Calcular momentum para cada activo
        momentum_scores = {}
        
        for asset in self.assets:
            if self.momentum_indicators[asset].IsReady:
                # Momentum = (Precio actual - Precio hace 3 meses) / Precio hace 3 meses
                current_price = self.Securities[asset].Price
                price_3m_ago = self.momentum_indicators[asset].Current.Value
                momentum = (current_price - price_3m_ago) / price_3m_ago
                momentum_scores[asset] = momentum
        
        # Seleccionar el activo con mejor momentum
        if momentum_scores:
            best_asset = max(momentum_scores, key=momentum_scores.get)
            
            # Solo cambiar si es diferente al actual
            if best_asset != self.current_asset:
                # Liquidar posición actual
                if self.current_asset:
                    self.Liquidate(self.current_asset)
                
                # Comprar nuevo activo
                self.SetHoldings(best_asset, 1.0)
                self.current_asset = best_asset
                
                self.Debug(f"Rotated to {best_asset} with momentum: {momentum_scores[best_asset]:.4f}")
    
    def OnData(self, data):
        # Esta estrategia se basa en rebalanceo programado
        pass
    
    def OnEndOfAlgorithm(self):
        self.Debug("Multi-Asset Rotation Strategy Completed")`
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
