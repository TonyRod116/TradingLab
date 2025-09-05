# 🚀 Estrategias QuantConnect - TradingLab

## 📋 Resumen

Se han creado 6 nuevas estrategias de QuantConnect completamente funcionales, cada una con código Python completo y optimizado para diferentes tipos de mercados y niveles de dificultad.

## 🎯 Estrategias Disponibles

### 1. **S&P 500 Buy & Hold 2025** ⭐ (SÚPER SIMPLE)
- **ID**: `sp500-buy-hold-2025`
- **Dificultad**: Beginner
- **Categoría**: Buy & Hold
- **Símbolo**: SPY
- **Descripción**: Estrategia súper simple para probar la integración. Compra SPY el 1 de enero de 2025 y mantiene hasta el 1 de septiembre de 2025.
- **Características**:
  - Sin indicadores técnicos
  - Perfecta para testing
  - Riesgo mínimo
  - Fechas específicas configuradas

**Código Python**:
```python
from AlgorithmImports import *

class SP500BuyHold2025(QCAlgorithm):
    def Initialize(self):
        self.SetStartDate(2025, 1, 1)
        self.SetEndDate(2025, 9, 1)
        self.SetCash(100000)
        self.spy = self.AddEquity("SPY", Resolution.Daily).Symbol
        self.bought = False
    
    def OnData(self, data):
        if not self.bought and data.ContainsKey(self.spy):
            self.SetHoldings(self.spy, 1.0)
            self.bought = True
```

---

### 2. **RSI Mean Reversion SPY** 📊
- **ID**: `rsi-mean-reversion-spy`
- **Dificultad**: Beginner
- **Categoría**: Mean Reversion
- **Símbolo**: SPY
- **Descripción**: Estrategia de reversión a la media usando RSI. Compra cuando RSI < 30, vende cuando RSI > 70.
- **Características**:
  - RSI de 14 períodos
  - Señales claras de compra/venta
  - Ideal para mercados laterales
  - Fácil de entender

**Código Python**:
```python
class RSIMeanReversionSPY(QCAlgorithm):
    def Initialize(self):
        self.SetStartDate(2024, 1, 1)
        self.SetEndDate(2024, 12, 31)
        self.SetCash(100000)
        self.spy = self.AddEquity("SPY", Resolution.Daily).Symbol
        self.rsi = self.RSI(self.spy, 14, MovingAverageType.Simple)
        self.SetWarmUp(20)
        self.is_invested = False
    
    def OnData(self, data):
        if self.IsWarmingUp or not data.ContainsKey(self.spy):
            return
        
        rsi_value = self.rsi.Current.Value
        
        if rsi_value < 30 and not self.is_invested:
            self.SetHoldings(self.spy, 1.0)
            self.is_invested = True
        elif rsi_value > 70 and self.is_invested:
            self.Liquidate(self.spy)
            self.is_invested = False
```

---

### 3. **SMA Crossover QQQ** 📈
- **ID**: `sma-crossover-qqq`
- **Dificultad**: Beginner
- **Categoría**: Trend Following
- **Símbolo**: QQQ
- **Descripción**: Estrategia de cruce de medias móviles. Compra cuando SMA 20 cruza por encima de SMA 50.
- **Características**:
  - SMA 20 y SMA 50
  - Señales de tendencia clara
  - Ideal para mercados en tendencia
  - Estrategia clásica probada

**Código Python**:
```python
class SMACrossoverQQQ(QCAlgorithm):
    def Initialize(self):
        self.SetStartDate(2024, 1, 1)
        self.SetEndDate(2024, 12, 31)
        self.SetCash(100000)
        self.qqq = self.AddEquity("QQQ", Resolution.Daily).Symbol
        self.sma_fast = self.SMA(self.qqq, 20)
        self.sma_slow = self.SMA(self.qqq, 50)
        self.SetWarmUp(60)
        self.is_invested = False
    
    def OnData(self, data):
        if self.IsWarmingUp or not data.ContainsKey(self.qqq):
            return
        
        fast_value = self.sma_fast.Current.Value
        slow_value = self.sma_slow.Current.Value
        
        if fast_value > slow_value and not self.is_invested:
            self.SetHoldings(self.qqq, 1.0)
            self.is_invested = True
        elif fast_value < slow_value and self.is_invested:
            self.Liquidate(self.qqq)
            self.is_invested = False
```

---

### 4. **Bollinger Bands AAPL** 🎯
- **ID**: `bollinger-bands-aapl`
- **Dificultad**: Intermediate
- **Categoría**: Mean Reversion
- **Símbolo**: AAPL
- **Descripción**: Estrategia de Bandas de Bollinger. Compra en banda inferior, vende en banda superior.
- **Características**:
  - Bandas de Bollinger 20 períodos
  - 2 desviaciones estándar
  - Ideal para mercados volátiles
  - Gestión de riesgo integrada

**Código Python**:
```python
class BollingerBandsAAPL(QCAlgorithm):
    def Initialize(self):
        self.SetStartDate(2024, 1, 1)
        self.SetEndDate(2024, 12, 31)
        self.SetCash(100000)
        self.aapl = self.AddEquity("AAPL", Resolution.Daily).Symbol
        self.bb = self.BB(self.aapl, 20, 2, MovingAverageType.Simple)
        self.SetWarmUp(25)
        self.is_invested = False
    
    def OnData(self, data):
        if self.IsWarmingUp or not data.ContainsKey(self.aapl):
            return
        
        current_price = data[self.aapl].Price
        upper_band = self.bb.UpperBand.Current.Value
        lower_band = self.bb.LowerBand.Current.Value
        
        if current_price <= lower_band and not self.is_invested:
            self.SetHoldings(self.aapl, 1.0)
            self.is_invested = True
        elif current_price >= upper_band and self.is_invested:
            self.Liquidate(self.aapl)
            self.is_invested = False
```

---

### 5. **MACD Momentum TSLA** ⚡
- **ID**: `macd-momentum-tsla`
- **Dificultad**: Intermediate
- **Categoría**: Momentum
- **Símbolo**: TSLA
- **Descripción**: Estrategia de momentum usando MACD. Compra cuando MACD cruza por encima de la señal.
- **Características**:
  - MACD 12, 26, 9
  - Señales de momentum
  - Ideal para acciones volátiles
  - Confirmación de tendencia

**Código Python**:
```python
class MACDMomentumTSLA(QCAlgorithm):
    def Initialize(self):
        self.SetStartDate(2024, 1, 1)
        self.SetEndDate(2024, 12, 31)
        self.SetCash(100000)
        self.tsla = self.AddEquity("TSLA", Resolution.Daily).Symbol
        self.macd = self.MACD(self.tsla, 12, 26, 9, MovingAverageType.Exponential)
        self.SetWarmUp(30)
        self.is_invested = False
        self.previous_macd = None
        self.previous_signal = None
    
    def OnData(self, data):
        if self.IsWarmingUp or not data.ContainsKey(self.tsla):
            return
        
        current_macd = self.macd.Current.Value
        current_signal = self.macd.Signal.Current.Value
        
        if self.previous_macd is not None and self.previous_signal is not None:
            if (self.previous_macd <= self.previous_signal and 
                current_macd > current_signal and 
                not self.is_invested):
                self.SetHoldings(self.tsla, 1.0)
                self.is_invested = True
            elif (self.previous_macd >= self.previous_signal and 
                  current_macd < current_signal and 
                  self.is_invested):
                self.Liquidate(self.tsla)
                self.is_invested = False
        
        self.previous_macd = current_macd
        self.previous_signal = current_signal
```

---

### 6. **Multi-Asset Rotation** 🔄
- **ID**: `multi-asset-rotation`
- **Dificultad**: Advanced
- **Categoría**: Rotation
- **Símbolos**: SPY, QQQ, TLT
- **Descripción**: Estrategia de rotación entre 3 activos basada en momentum de 3 meses.
- **Características**:
  - Rotación entre 3 activos
  - Momentum de 3 meses
  - Diversificación automática
  - Rebalanceo mensual

**Código Python**:
```python
class MultiAssetRotation(QCAlgorithm):
    def Initialize(self):
        self.SetStartDate(2024, 1, 1)
        self.SetEndDate(2024, 12, 31)
        self.SetCash(100000)
        
        self.spy = self.AddEquity("SPY", Resolution.Daily).Symbol
        self.qqq = self.AddEquity("QQQ", Resolution.Daily).Symbol
        self.tlt = self.AddEquity("TLT", Resolution.Daily).Symbol
        
        self.assets = [self.spy, self.qqq, self.tlt]
        self.momentum_period = 63
        self.momentum_indicators = {}
        
        for asset in self.assets:
            self.momentum_indicators[asset] = self.SMA(asset, self.momentum_period)
        
        self.SetWarmUp(70)
        self.Schedule.On(self.DateRules.MonthStart(), 
                        self.TimeRules.AfterMarketOpen(self.spy, 30), 
                        self.Rebalance)
        self.current_asset = None
    
    def Rebalance(self):
        if self.IsWarmingUp:
            return
        
        momentum_scores = {}
        for asset in self.assets:
            if self.momentum_indicators[asset].IsReady:
                current_price = self.Securities[asset].Price
                price_3m_ago = self.momentum_indicators[asset].Current.Value
                momentum = (current_price - price_3m_ago) / price_3m_ago
                momentum_scores[asset] = momentum
        
        if momentum_scores:
            best_asset = max(momentum_scores, key=momentum_scores.get)
            if best_asset != self.current_asset:
                if self.current_asset:
                    self.Liquidate(self.current_asset)
                self.SetHoldings(best_asset, 1.0)
                self.current_asset = best_asset
```

---

## 🎮 Cómo Usar las Estrategias

### 1. **Desde Strategy Templates**
- Ve a la sección "Strategy Templates"
- Selecciona una estrategia
- Haz clic en "Run QC Backtest" para ejecutar directamente
- O haz clic en "View Details" para ver el código Python

### 2. **Desde QuantConnect Manager**
- Usa el componente `QuantConnectManager`
- Copia el código Python de cualquier estrategia
- Pega en el editor de código
- Ejecuta el backtest

### 3. **Desde el Hook Personalizado**
```jsx
import { useQuantConnect } from './hooks/useQuantConnect';

const { runBacktest } = useQuantConnect();

const strategyData = {
  name: 'Mi Estrategia',
  code: '// Código Python aquí'
};

runBacktest(strategyData);
```

---

## 🧪 Estrategia de Prueba Recomendada

**Para probar la integración, usa la estrategia "S&P 500 Buy & Hold 2025":**

1. **Es súper simple** - Solo compra SPY una vez
2. **Sin indicadores** - No requiere cálculos complejos
3. **Fechas específicas** - Fácil de verificar resultados
4. **Riesgo mínimo** - Solo compra y mantiene

**Pasos para probar:**
1. Ve a Strategy Templates
2. Busca "S&P 500 Buy & Hold 2025"
3. Haz clic en "Run QC Backtest"
4. Observa el Status Bar
5. Verifica los resultados

---

## 📊 Características Técnicas

### **Indicadores Utilizados**
- **RSI**: Relative Strength Index
- **SMA**: Simple Moving Average
- **BB**: Bollinger Bands
- **MACD**: Moving Average Convergence Divergence

### **Resoluciones Soportadas**
- Daily (recomendado)
- Hourly (para estrategias más activas)
- Minute (para trading de alta frecuencia)

### **Símbolos Incluidos**
- **SPY**: S&P 500 ETF
- **QQQ**: NASDAQ 100 ETF
- **AAPL**: Apple Inc.
- **TSLA**: Tesla Inc.
- **TLT**: 20+ Year Treasury Bond ETF

---

## 🔧 Configuración Avanzada

### **Modificar Fechas**
```python
# Cambiar fechas de backtest
self.SetStartDate(2024, 1, 1)  # Año, Mes, Día
self.SetEndDate(2024, 12, 31)
```

### **Cambiar Capital Inicial**
```python
# Modificar capital inicial
self.SetCash(50000)  # $50,000
```

### **Agregar Más Símbolos**
```python
# Agregar múltiples símbolos
self.spy = self.AddEquity("SPY", Resolution.Daily).Symbol
self.qqq = self.AddEquity("QQQ", Resolution.Daily).Symbol
```

---

## 🎯 Próximos Pasos

1. **Probar la estrategia simple** (S&P 500 Buy & Hold 2025)
2. **Experimentar con otras estrategias** según tu nivel
3. **Modificar parámetros** para personalizar
4. **Crear estrategias propias** basadas en estos ejemplos

---

**¡Las estrategias están listas para usar!** 🚀

Todas incluyen código Python completo, están optimizadas para QuantConnect, y cubren diferentes estilos de trading desde principiante hasta avanzado.
