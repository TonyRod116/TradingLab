# README_TRADELAB_ENGINE.md

# TradeLab Backtesting Engine - Documentación Completa

## 🚀 Características Principales

- **Motor de backtesting vectorizado** optimizado para rendimiento
- **Indicadores técnicos completos**: SMA, EMA, RSI, ATR, Bollinger Bands, VWAP, CCI, Stochastic, Williams %R, OBV, A/D Line
- **Sistema de reglas declarativo** con operadores AND/OR anidados
- **Múltiples tipos de stops/targets**: Porcentaje, puntos, ticks, ATR múltiplo
- **Gestión de riesgo avanzada**: comisiones, slippage, tamaño de posición
- **Métricas completas**: Sharpe, CAGR, Max Drawdown, Win Rate, Profit Factor, Expectancy
- **Optimización walk-forward** para validación out-of-sample
- **API REST con FastAPI** para integración web
- **Grid search** para optimización de parámetros

## 📁 Estructura de Archivos

```
tradelab/
├── tradelab_engine_complete.py    # Motor principal
├── tradelab_examples.py           # Ejemplos de uso
├── README_TRADELAB_ENGINE.md      # Esta documentación
└── requirements.txt               # Dependencias
```

## 🛠️ Instalación

```bash
pip install pandas numpy fastapi uvicorn
```

## 📊 Formato de Datos

### Estructura de Parquet Requerida

```
data/
└── ES/
    ├── 1m.parquet
    ├── 5m.parquet
    ├── 15m.parquet
    └── 1d.parquet
```

**Columnas requeridas:**
- `timestamp`: Fecha/hora (puede ser índice)
- `open`: Precio de apertura
- `high`: Precio máximo
- `low`: Precio mínimo
- `close`: Precio de cierre
- `volume`: Volumen

## 🎯 Formato de Estrategia (JSON)

### Estructura Básica

```json
{
  "meta": {
    "name": "Nombre de la Estrategia",
    "symbol": "ES",
    "timeframe": "5m"
  },
  "risk": {
    "initial_capital": 100000,
    "position_size": 1,
    "max_positions": 1,
    "commission_round_turn": 4.0,
    "slippage_ticks": 0.5,
    "tick_value": 12.5,
    "tick_size": 0.25
  },
  "stops_targets": {
    "stop_loss": {"type": "ATR", "value": 2.0},
    "take_profit": {"type": "Points", "value": 4.0}
  },
  "entries": [...],
  "exits": [...]
}
```

### Tipos de Stops/Targets

- **"Percentage"**: Porcentaje del precio de entrada
- **"Points"**: Puntos de precio fijos
- **"Ticks"**: Múltiplos del tick size
- **"ATR"**: Múltiplos del Average True Range

### Sistema de Reglas

#### Comparación Simple
```json
{
  "left": {"type": "indicator", "id": "RSI", "params": {"length": 14}},
  "cmp": "<=",
  "right": {"type": "value", "value": 30}
}
```

#### Comparación Entre Indicadores
```json
{
  "left": {"type": "indicator", "id": "EMA", "params": {"length": 12}},
  "cmp": ">",
  "right": {"type": "indicator", "id": "EMA", "params": {"length": 26}}
}
```

#### Lógica Compuesta (AND/OR)
```json
{
  "op": "AND",
  "clauses": [
    {
      "left": {"type": "indicator", "id": "EMA", "params": {"length": 12}},
      "cmp": ">",
      "right": {"type": "indicator", "id": "EMA", "params": {"length": 26}}
    },
    {
      "left": {"type": "indicator", "id": "RSI", "params": {"length": 14}},
      "cmp": "<=",
      "right": {"type": "value", "value": 30}
    }
  ]
}
```

## 📈 Indicadores Disponibles

### Precios
- `CLOSE`, `OPEN`, `HIGH`, `LOW`, `VOLUME`

### Promedios Móviles
- `SMA`: Simple Moving Average
- `EMA`: Exponential Moving Average

### Osciladores
- `RSI`: Relative Strength Index
- `CCI`: Commodity Channel Index
- `STOCH_K`: Stochastic %K
- `STOCH_D`: Stochastic %D
- `WILLIAMS_R`: Williams %R

### Volatilidad
- `ATR`: Average True Range
- `BOLLINGER_UPPER`: Bollinger Bands Upper
- `BOLLINGER_MIDDLE`: Bollinger Bands Middle
- `BOLLINGER_LOWER`: Bollinger Bands Lower

### Volumen
- `VWAP`: Volume Weighted Average Price
- `OBV`: On-Balance Volume
- `AD_LINE`: Accumulation/Distribution Line

## 🔧 Uso Básico

### Backtest Individual

```python
from tradelab_engine_complete import load_parquet, RiskConfig, StopTarget, Backtester

# Cargar datos
df = load_parquet("ES", "5m", "/data/ohlcv")

# Configurar riesgo
risk = RiskConfig(
    initial_capital=100000,
    position_size=1,
    max_positions=1,
    commission_round_turn=4.0,
    slippage_ticks=0.5,
    tick_value=12.5,
    tick_size=0.25
)

# Configurar stops/targets
stops = StopTarget(type="ATR", value=2.0)
targets = StopTarget(type="Points", value=4.0)

# Definir reglas
entries = [{
    "side": "LONG",
    "logic": {
        "op": "AND",
        "clauses": [
            {
                "left": {"type": "indicator", "id": "EMA", "params": {"length": 12}},
                "cmp": ">",
                "right": {"type": "indicator", "id": "EMA", "params": {"length": 26}}
            },
            {
                "left": {"type": "indicator", "id": "RSI", "params": {"length": 14}},
                "cmp": "<=",
                "right": {"type": "value", "value": 30}
            }
        ]
    }
}]

exits = [{
    "side": "LONG",
    "logic": {
        "left": {"type": "indicator", "id": "RSI", "params": {"length": 14}},
        "cmp": ">=",
        "right": {"type": "value", "value": 70}
    }
}]

# Ejecutar backtest
bt = Backtester(df, risk, stops, targets)
result = bt.run(entries, exits)

# Mostrar resultados
print(f"Total Return: {result.metrics['Total Return %']:.2f}%")
print(f"Sharpe Ratio: {result.metrics['Sharpe Ratio']:.2f}")
print(f"Max Drawdown: {result.metrics['Max Drawdown %']:.2f}%")
print(f"Win Rate: {result.metrics['Win Rate %']:.2f}%")
print(f"Total Trades: {result.metrics['Total Trades']}")
```

## 🚀 API REST

### Iniciar Servidor

```bash
python tradelab_engine_complete.py
```

### Endpoints Disponibles

#### 1. Listar Indicadores
```bash
GET /indicators
```

#### 2. Ejecutar Backtest
```bash
POST /backtest
Content-Type: application/json

{
  "base_path": "/data/ohlcv",
  "strategy_json": {
    "meta": {"name": "Test", "symbol": "ES", "timeframe": "5m"},
    "risk": {...},
    "stops_targets": {...},
    "entries": [...],
    "exits": [...]
  }
}
```

#### 3. Optimización Walk-Forward
```bash
POST /optimize
Content-Type: application/json

{
  "base_path": "/data/ohlcv",
  "strategy_template": {...},
  "param_ranges": {
    "ema_fast": [8, 12, 16],
    "ema_slow": [20, 26, 30],
    "rsi_threshold": [25, 30, 35]
  },
  "train_months": 6,
  "test_months": 1,
  "step_months": 1
}
```

#### 4. Grid Search
```bash
POST /grid_search
Content-Type: application/json

{
  "base_path": "/data/ohlcv",
  "strategy_json": {
    "meta": {...},
    "risk": {...},
    "stops_targets": {...},
    "entries": [...],
    "exits": [...],
    "param_ranges": {
      "ema_fast": [8, 12, 16],
      "ema_slow": [20, 26, 30]
    }
  }
}
```

## 📊 Métricas Disponibles

### Rendimiento
- **Total Return**: Retorno total
- **Total Return %**: Retorno total en porcentaje
- **CAGR**: Compound Annual Growth Rate
- **CAGR %**: CAGR en porcentaje

### Riesgo
- **Sharpe Ratio**: Ratio de Sharpe anualizado
- **Max Drawdown**: Máxima pérdida desde un pico
- **Max Drawdown %**: Máxima pérdida en porcentaje
- **Volatility**: Volatilidad anualizada
- **Volatility %**: Volatilidad en porcentaje

### Trading
- **Total Trades**: Número total de trades
- **Winning Trades**: Número de trades ganadores
- **Losing Trades**: Número de trades perdedores
- **Win Rate**: Tasa de acierto
- **Win Rate %**: Tasa de acierto en porcentaje
- **Profit Factor**: Factor de beneficio
- **Expectancy**: Expectativa por trade

### Detalles de Trades
- **Average Win**: Ganancia promedio
- **Average Loss**: Pérdida promedio
- **Largest Win**: Mayor ganancia
- **Largest Loss**: Mayor pérdida
- **Max Consecutive Wins**: Máximo de ganancias consecutivas
- **Max Consecutive Losses**: Máximo de pérdidas consecutivas

## 🔄 Optimización Walk-Forward

La optimización walk-forward divide los datos en ventanas de entrenamiento y prueba:

1. **Entrenamiento**: Optimiza parámetros en datos históricos
2. **Prueba**: Evalúa rendimiento en datos futuros
3. **Deslizamiento**: Avanza la ventana y repite

### Parámetros de Configuración

- `train_months`: Meses de datos de entrenamiento
- `test_months`: Meses de datos de prueba
- `step_months`: Meses de avance de ventana

### Ejemplo de Uso

```python
from tradelab_engine_complete import walk_forward_optimization

result = walk_forward_optimization(
    df=df,
    strategy_template=strategy_template,
    param_ranges={
        "ema_fast": [8, 12, 16],
        "ema_slow": [20, 26, 30],
        "rsi_threshold": [25, 30, 35]
    },
    train_months=6,
    test_months=1,
    step_months=1
)

print(f"Mejores parámetros: {result.best_params}")
print(f"Rendimiento OOS: {result.oos_performance}")
```

## 🎨 Ejemplos de Estrategias

### 1. EMA Cross con Filtro RSI
```python
def create_ema_cross_rsi_strategy():
    return {
        "meta": {"name": "EMA Cross RSI", "symbol": "ES", "timeframe": "5m"},
        "risk": {...},
        "stops_targets": {...},
        "entries": [{
            "side": "LONG",
            "logic": {
                "op": "AND",
                "clauses": [
                    {
                        "left": {"type": "indicator", "id": "EMA", "params": {"length": 12}},
                        "cmp": ">",
                        "right": {"type": "indicator", "id": "EMA", "params": {"length": 26}}
                    },
                    {
                        "left": {"type": "indicator", "id": "RSI", "params": {"length": 14}},
                        "cmp": "<=",
                        "right": {"type": "value", "value": 30}
                    }
                ]
            }
        }],
        "exits": [...]
    }
```

### 2. Bollinger Bands Mean Reversion
```python
def create_bollinger_strategy():
    return {
        "entries": [{
            "side": "LONG",
            "logic": {
                "left": {"type": "indicator", "id": "CLOSE"},
                "cmp": "<",
                "right": {"type": "indicator", "id": "BOLLINGER_LOWER", "params": {"length": 20, "mult": 2.0}}
            }
        }],
        "exits": [...]
    }
```

### 3. VWAP Trend Following
```python
def create_vwap_strategy():
    return {
        "entries": [{
            "side": "LONG",
            "logic": {
                "op": "AND",
                "clauses": [
                    {
                        "left": {"type": "indicator", "id": "CLOSE"},
                        "cmp": ">",
                        "right": {"type": "indicator", "id": "VWAP"}
                    },
                    {
                        "left": {"type": "indicator", "id": "VOLUME"},
                        "cmp": ">",
                        "right": {"type": "indicator", "id": "SMA", "params": {"length": 20}}
                    }
                ]
            }
        }],
        "exits": [...]
    }
```

## ⚡ Optimizaciones de Rendimiento

### 1. Vectorización
- Todos los indicadores están vectorizados con pandas/numpy
- Cálculos de señales en lotes para mejor rendimiento

### 2. Multiprocessing
- Para optimización de parámetros en paralelo
- Usar `ProcessPoolExecutor` para grids grandes

### 3. Memoria
- Precomputar indicadores comunes (ATR, SMA, etc.)
- Reutilizar cálculos entre estrategias similares

## 🐛 Debugging y Troubleshooting

### Errores Comunes

1. **FileNotFoundError**: Verificar rutas de datos Parquet
2. **ValueError**: Indicador no soportado
3. **KeyError**: Parámetros faltantes en configuración
4. **IndexError**: Datos insuficientes para cálculos

### Logging

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Validación de Datos

```python
# Verificar estructura de datos
print(df.head())
print(df.info())
print(df.describe())

# Verificar fechas
print(f"Rango de fechas: {df.index[0]} a {df.index[-1]}")
print(f"Total de barras: {len(df)}")
```

## 🔮 Extensiones Futuras

### Indicadores Adicionales
- MACD
- Ichimoku Cloud
- Parabolic SAR
- Average Directional Index (ADX)

### Funcionalidades Avanzadas
- Portfolio de múltiples estrategias
- Risk parity
- Monte Carlo simulation
- Regime detection

### Integración
- Conexión con brokers reales
- Datos en tiempo real
- Alertas y notificaciones
- Dashboard web

## 📝 Notas de Implementación

### Consideraciones de Trading
- **Slippage**: Se aplica tanto en entrada como salida
- **Comisiones**: Se cobran por round turn completo
- **Stops/Targets**: Se ejecutan intrabar usando OHLC
- **Posiciones**: Solo una posición por símbolo simultáneamente

### Limitaciones Actuales
- No soporta múltiples símbolos simultáneamente
- No incluye gestión de margen
- No considera gaps de precio
- Optimización básica (sin algoritmos genéticos)

## 🤝 Contribuciones

Para contribuir al proyecto:

1. Fork del repositorio
2. Crear branch para nueva funcionalidad
3. Implementar cambios con tests
4. Enviar pull request

### Áreas de Contribución
- Nuevos indicadores técnicos
- Optimizaciones de rendimiento
- Mejoras en la API
- Documentación y ejemplos
- Tests unitarios

---

**TradeLab Engine v2.0** - Motor de backtesting profesional para estrategias de trading algorítmico.
