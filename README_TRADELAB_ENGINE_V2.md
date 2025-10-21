# README_TRADELAB_ENGINE_V2.md

# TradeLab Backtesting Engine v2.0 - Documentación Completa

## 🚀 Nuevas Características v2.0

### ✅ **Métricas Avanzadas**
- **Win Rate**: Tasa de acierto de trades
- **Profit Factor**: Ratio ganancias/pérdidas
- **Avg Trade**: Ganancia promedio por trade
- **Expectancy**: Expectativa matemática por trade

### ✅ **Optimización por Grid**
- Búsqueda exhaustiva de parámetros
- Criterio de optimización: Sharpe Ratio
- Soporte para parámetros con `$param_name`
- Resultados limitados a 50 combinaciones

### ✅ **Walk-Forward Optimization**
- Ventanas de entrenamiento y prueba personalizables
- Selección automática de mejores parámetros por ventana
- Métricas OOS agregadas
- Equity curve y trades concatenados

### ✅ **API REST Mejorada**
- `POST /optimize`: Optimización por grid
- `POST /walkforward`: Walk-forward con ventanas específicas
- Respuestas estructuradas con métricas completas

## 📊 Métricas Disponibles (8 Principales)

### Rendimiento
- **Total Return**: Retorno total
- **CAGR**: Compound Annual Growth Rate

### Riesgo
- **Sharpe Ratio**: Ratio de Sharpe anualizado
- **Max Drawdown**: Máxima pérdida desde un pico

### Trading
- **Win Rate**: Tasa de acierto
- **Profit Factor**: Factor de beneficio
- **Avg Trade**: Ganancia promedio por trade
- **Expectancy**: Expectativa matemática

## 🔧 Uso de las Nuevas Funcionalidades

### 1. Optimización por Grid

#### Formato de Estrategia con Parámetros
```json
{
  "entries": [{
    "side": "LONG",
    "logic": {
      "op": "AND",
      "clauses": [
        {
          "left": {"type": "indicator", "id": "EMA", "params": {"length": "$EMA_fast"}},
          "cmp": ">",
          "right": {"type": "indicator", "id": "EMA", "params": {"length": "$EMA_slow"}}
        },
        {
          "left": {"type": "indicator", "id": "RSI", "params": {"length": "$RSI_len"}},
          "cmp": "<=",
          "right": {"type": "value", "value": "$RSI_threshold"}
        }
      ]
    }
  }]
}
```

#### Request de Optimización
```json
{
  "base_path": "/data/ohlcv",
  "strategy_json": {
    "meta": {"name": "EMA+RSI", "symbol": "ES", "timeframe": "5m"},
    "risk": {...},
    "stops_targets": {...},
    "entries": [...],
    "exits": [...]
  },
  "param_grid": {
    "EMA_fast": [8, 12, 16],
    "EMA_slow": [20, 26, 30],
    "RSI_len": [10, 14],
    "RSI_threshold": [25, 30, 35]
  }
}
```

#### Respuesta de Optimización
```json
{
  "best_params": {
    "EMA_fast": 12,
    "EMA_slow": 26,
    "RSI_len": 14,
    "RSI_threshold": 30
  },
  "best_sharpe": 1.45,
  "all_results": [
    {
      "params": {...},
      "sharpe": 1.45,
      "total_return": 0.152,
      "max_drawdown": -0.083,
      "win_rate": 0.42,
      "profit_factor": 1.8,
      "trades": 156
    }
  ]
}
```

### 2. Walk-Forward Optimization

#### Request de Walk-Forward
```json
{
  "base_path": "/data/ohlcv",
  "strategy_json": {...},
  "param_grid": {...},
  "windows": [
    {
      "train_start": "2020-01-01",
      "train_end": "2020-06-01",
      "test_start": "2020-06-01",
      "test_end": "2020-09-01"
    },
    {
      "train_start": "2020-06-01",
      "train_end": "2020-12-01",
      "test_start": "2020-12-01",
      "test_end": "2021-03-01"
    }
  ]
}
```

#### Respuesta de Walk-Forward
```json
{
  "train_results": [
    {
      "period": "2020-01 to 2020-06",
      "best_params": {...},
      "best_sharpe": 1.32
    }
  ],
  "test_results": [
    {
      "period": "2020-06 to 2020-09",
      "metrics": {...},
      "trades": 45,
      "equity_curve": [...],
      "trades": [...]
    }
  ],
  "best_params": {...},
  "oos_performance": {
    "Average Return": 0.08,
    "Total Return": 0.24,
    "Sharpe Ratio": 1.28,
    "Max Drawdown": -0.12,
    "Total Trades": 134
  },
  "oos_equity_curve": [...],
  "oos_trades": [...]
}
```

## 📈 Interpretación de Métricas

### Profit Factor
- **> 1.0**: Estrategia rentable
- **1.5-2.0**: Buena estrategia
- **> 2.0**: Excelente estrategia
- **< 1.0**: Estrategia perdedora

### Win Rate
- **> 50%**: Mayoría de trades ganadores
- **40-50%**: Balanceado
- **< 40%**: Pocos trades ganadores (pero pueden ser grandes)

### Expectancy
- **> 0**: Ganancia promedio positiva
- **= 0**: Break-even
- **< 0**: Pérdida promedio

### Análisis de Asimetría
Una estrategia puede ser rentable con:
- **Win Rate bajo (30-40%)** + **Profit Factor alto (>2.0)**
- **Win Rate alto (>60%)** + **Profit Factor moderado (1.2-1.5)**

## 🎯 Mini-prácticas

### 1. Smoke Test
```python
# Ejecutar backtest básico y verificar métricas
response = requests.post("/backtest", json={
    "base_path": "/data/ohlcv",
    "strategy_json": strategy
})

metrics = response.json()["metrics"]
required_metrics = ["Total Return", "CAGR", "Sharpe Ratio", "Max Drawdown", 
                    "Win Rate", "Profit Factor", "Avg Trade", "Expectancy"]

assert all(metric in metrics for metric in required_metrics)
```

### 2. Grid Pequeño
```python
# Optimización con 2×2×2 combinaciones
param_grid = {
    "EMA_fast": [8, 12],
    "EMA_slow": [20, 26],
    "RSI_threshold": [25, 30]
}

response = requests.post("/optimize", json={
    "base_path": "/data/ohlcv",
    "strategy_json": strategy,
    "param_grid": param_grid
})

best_params = response.json()["best_params"]
print(f"Mejores parámetros: {best_params}")
```

### 3. Walk-Forward
```python
# 3 ventanas trimestrales en 2021
windows = [
    {"train_start": "2021-01-01", "train_end": "2021-04-01", 
     "test_start": "2021-04-01", "test_end": "2021-07-01"},
    {"train_start": "2021-04-01", "train_end": "2021-07-01", 
     "test_start": "2021-07-01", "test_end": "2021-10-01"},
    {"train_start": "2021-07-01", "train_end": "2021-10-01", 
     "test_start": "2021-10-01", "test_end": "2022-01-01"}
]

response = requests.post("/walkforward", json={
    "base_path": "/data/ohlcv",
    "strategy_json": strategy,
    "param_grid": param_grid,
    "windows": windows
})

oos_performance = response.json()["oos_performance"]
print(f"Sharpe OOS: {oos_performance['Sharpe Ratio']:.2f}")
```

### 4. Análisis de Métricas
```python
# Interpretar Profit Factor 1.8, Win Rate 40%, Expectancy positiva
metrics = {
    "Profit Factor": 1.8,
    "Win Rate": 0.40,
    "Expectancy": 12.5
}

print("Interpretación:")
print(f"• Profit Factor {metrics['Profit Factor']}: Por cada $1 perdido, se gana ${metrics['Profit Factor']}")
print(f"• Win Rate {metrics['Win Rate']*100}%: 40% de trades ganadores")
print(f"• Expectancy ${metrics['Expectancy']}: Ganancia promedio por trade")

# Calcular asimetría
if metrics['Win Rate'] < 0.5 and metrics['Profit Factor'] > 1.5:
    print("• Estrategia de asimetría: pocas ganancias grandes compensan muchas pérdidas pequeñas")
```

## 🔄 Flujo de Trabajo Recomendado

### 1. Desarrollo de Estrategia
1. **Crear estrategia base** con parámetros fijos
2. **Ejecutar backtest** para validar lógica
3. **Analizar métricas** básicas

### 2. Optimización
1. **Identificar parámetros** a optimizar
2. **Definir rangos** de valores
3. **Ejecutar grid search** con `/optimize`
4. **Seleccionar mejores parámetros** por Sharpe

### 3. Validación
1. **Definir ventanas** de walk-forward
2. **Ejecutar walk-forward** con `/walkforward`
3. **Comparar rendimiento** in-sample vs out-of-sample
4. **Validar estabilidad** de parámetros

### 4. Implementación
1. **Usar parámetros finales** en estrategia
2. **Monitorear rendimiento** en producción
3. **Re-optimizar periódicamente** con nuevos datos

## 🚀 Próximas Funcionalidades

### En Desarrollo
- **Soporte de posiciones simultáneas** (hasta `max_positions`)
- **Trailing stops** (por ATR/por %)
- **Indicadores adicionales** (MACD, Ichimoku, Parabolic SAR)
- **Batch multi-símbolo** con agregación de equity

### Roadmap
- **Monte Carlo simulation** para análisis de riesgo
- **Regime detection** para adaptación de estrategias
- **Portfolio optimization** con múltiples estrategias
- **Real-time data integration** para trading en vivo

## 📝 Notas de Implementación

### Consideraciones de Rendimiento
- **Grid search**: Limitado a 50 resultados para evitar respuestas muy grandes
- **Walk-forward**: Procesamiento secuencial por ventana
- **Métricas**: Cálculo optimizado con numpy/pandas

### Limitaciones Actuales
- **Una posición por símbolo** simultáneamente
- **Optimización básica** (sin algoritmos genéticos)
- **Sin gestión de margen** o leverage

### Mejores Prácticas
- **Validar datos** antes de optimización
- **Usar ventanas suficientes** para walk-forward
- **Interpretar métricas** en contexto de riesgo
- **Documentar parámetros** y resultados

---

**TradeLab Engine v2.0** - Motor de backtesting profesional con optimización avanzada y métricas completas.
