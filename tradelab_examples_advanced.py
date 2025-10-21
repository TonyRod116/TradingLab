# tradelab_examples_advanced.py
"""
Ejemplos avanzados del motor de backtesting TradeLab
Incluye optimización, walk-forward y nuevas funcionalidades
"""

import json
import requests
from tradelab_engine_complete import (
    load_parquet, RiskConfig, StopTarget, Backtester,
    walk_forward_optimization, create_strategy_with_params
)

# ---------- EJEMPLO 1: Optimización por Grid ----------
def create_optimizable_strategy():
    """Estrategia con parámetros optimizables usando $param_name"""
    return {
        "meta": {
            "name": "EMA Cross Optimizable",
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
        }],
        "exits": [{
            "side": "LONG",
            "logic": {
                "left": {"type": "indicator", "id": "RSI", "params": {"length": "$RSI_len"}},
                "cmp": ">=",
                "right": {"type": "value", "value": 70}
            }
        }]
    }

def run_grid_optimization_example():
    """Ejemplo de optimización por grid usando la API"""
    print("=== Ejemplo de Optimización por Grid ===")
    
    # Crear estrategia optimizable
    strategy = create_optimizable_strategy()
    
    # Definir grid de parámetros
    param_grid = {
        "EMA_fast": [8, 12, 16, 20],
        "EMA_slow": [20, 26, 30, 34],
        "RSI_len": [10, 14, 18],
        "RSI_threshold": [25, 30, 35]
    }
    
    # JSON para enviar a la API
    request_data = {
        "base_path": "/data/ohlcv",
        "strategy_json": strategy,
        "param_grid": param_grid
    }
    
    print("Grid de parámetros:")
    for param, values in param_grid.items():
        print(f"  {param}: {values}")
    
    print(f"\nTotal combinaciones: {len(list(__import__('itertools').product(*param_grid.values())))}")
    
    # Simular llamada a la API (en producción sería requests.post)
    print("\nJSON para enviar a POST /optimize:")
    print(json.dumps(request_data, indent=2))
    
    return request_data

# ---------- EJEMPLO 2: Walk-Forward Optimization ----------
def run_walkforward_example():
    """Ejemplo de optimización walk-forward"""
    print("\n=== Ejemplo de Walk-Forward Optimization ===")
    
    strategy = create_optimizable_strategy()
    
    # Definir ventanas de entrenamiento y prueba
    windows = [
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
        },
        {
            "train_start": "2020-12-01",
            "train_end": "2021-06-01",
            "test_start": "2021-06-01",
            "test_end": "2021-09-01"
        }
    ]
    
    param_grid = {
        "EMA_fast": [8, 12, 16],
        "EMA_slow": [20, 26, 30],
        "RSI_len": [10, 14],
        "RSI_threshold": [25, 30]
    }
    
    request_data = {
        "base_path": "/data/ohlcv",
        "strategy_json": strategy,
        "param_grid": param_grid,
        "windows": windows
    }
    
    print("Ventanas de Walk-Forward:")
    for i, window in enumerate(windows, 1):
        print(f"  Ventana {i}:")
        print(f"    Entrenamiento: {window['train_start']} a {window['train_end']}")
        print(f"    Prueba: {window['test_start']} a {window['test_end']}")
    
    print("\nJSON para enviar a POST /walkforward:")
    print(json.dumps(request_data, indent=2))
    
    return request_data

# ---------- EJEMPLO 3: Análisis de Métricas ----------
def analyze_metrics_example():
    """Ejemplo de interpretación de métricas"""
    print("\n=== Análisis de Métricas ===")
    
    # Ejemplo de métricas de una estrategia
    example_metrics = {
        "Total Return %": 15.2,
        "CAGR %": 12.8,
        "Sharpe Ratio": 1.45,
        "Max Drawdown %": -8.3,
        "Win Rate %": 42.0,
        "Profit Factor": 1.8,
        "Expectancy": 12.5,
        "Avg Trade": 12.5,
        "Total Trades": 156,
        "Winning Trades": 66,
        "Losing Trades": 90
    }
    
    print("Métricas de ejemplo:")
    for metric, value in example_metrics.items():
        print(f"  {metric}: {value}")
    
    print("\nInterpretación:")
    print(f"• Profit Factor {example_metrics['Profit Factor']}: Por cada $1 perdido, se gana ${example_metrics['Profit Factor']}")
    print(f"• Win Rate {example_metrics['Win Rate %']}%: {example_metrics['Winning Trades']} trades ganadores de {example_metrics['Total Trades']} total")
    print(f"• Expectancy ${example_metrics['Expectancy']}: Ganancia promedio por trade")
    print(f"• Sharpe {example_metrics['Sharpe Ratio']}: Rendimiento ajustado por riesgo (bueno si > 1.0)")
    print(f"• Max Drawdown {example_metrics['Max Drawdown %']}%: Máxima pérdida desde un pico")
    
    print("\nAnálisis de Asimetría:")
    avg_win = example_metrics['Expectancy'] / (example_metrics['Win Rate %'] / 100)
    avg_loss = example_metrics['Expectancy'] / ((100 - example_metrics['Win Rate %']) / 100)
    print(f"• Ganancia promedio estimada: ${avg_win:.2f}")
    print(f"• Pérdida promedio estimada: ${avg_loss:.2f}")
    print(f"• Ratio ganancia/pérdida: {avg_win/abs(avg_loss):.2f}")
    
    return example_metrics

# ---------- EJEMPLO 4: Estrategia con Múltiples Condiciones ----------
def create_complex_strategy():
    """Estrategia compleja con múltiples indicadores y condiciones"""
    return {
        "meta": {
            "name": "Multi-Indicator Complex Strategy",
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
            "stop_loss": {"type": "ATR", "value": 1.5},
            "take_profit": {"type": "ATR", "value": 3.0}
        },
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
                        "cmp": ">",
                        "right": {"type": "value", "value": 50}
                    },
                    {
                        "left": {"type": "indicator", "id": "CCI", "params": {"length": 20}},
                        "cmp": ">",
                        "right": {"type": "value", "value": 0}
                    },
                    {
                        "op": "OR",
                        "clauses": [
                            {
                                "left": {"type": "indicator", "id": "STOCH_K", "params": {"k_period": 14, "d_period": 3}},
                                "cmp": ">",
                                "right": {"type": "value", "value": 20}
                            },
                            {
                                "left": {"type": "indicator", "id": "VOLUME"},
                                "cmp": ">",
                                "right": {"type": "indicator", "id": "SMA", "params": {"length": 20}}
                            }
                        ]
                    }
                ]
            }
        }],
        "exits": [{
            "side": "LONG",
            "logic": {
                "op": "OR",
                "clauses": [
                    {
                        "left": {"type": "indicator", "id": "RSI", "params": {"length": 14}},
                        "cmp": ">=",
                        "right": {"type": "value", "value": 70}
                    },
                    {
                        "left": {"type": "indicator", "id": "EMA", "params": {"length": 12}},
                        "cmp": "<",
                        "right": {"type": "indicator", "id": "EMA", "params": {"length": 26}}
                    },
                    {
                        "left": {"type": "indicator", "id": "CCI", "params": {"length": 20}},
                        "cmp": "<",
                        "right": {"type": "value", "value": -100}
                    }
                ]
            }
        }]
    }

# ---------- EJEMPLO 5: Comparación de Estrategias con Optimización ----------
def compare_optimized_strategies():
    """Comparar estrategias optimizadas"""
    print("\n=== Comparación de Estrategias Optimizadas ===")
    
    strategies = [
        ("EMA Cross Simple", {
            "entries": [{
                "side": "LONG",
                "logic": {
                    "left": {"type": "indicator", "id": "EMA", "params": {"length": 12}},
                    "cmp": ">",
                    "right": {"type": "indicator", "id": "EMA", "params": {"length": 26}}
                }
            }],
            "exits": [{
                "side": "LONG",
                "logic": {
                    "left": {"type": "indicator", "id": "EMA", "params": {"length": 12}},
                    "cmp": "<",
                    "right": {"type": "indicator", "id": "EMA", "params": {"length": 26}}
                }
            }]
        }),
        ("RSI Mean Reversion", {
            "entries": [{
                "side": "LONG",
                "logic": {
                    "left": {"type": "indicator", "id": "RSI", "params": {"length": 14}},
                    "cmp": "<=",
                    "right": {"type": "value", "value": 30}
                }
            }],
            "exits": [{
                "side": "LONG",
                "logic": {
                    "left": {"type": "indicator", "id": "RSI", "params": {"length": 14}},
                    "cmp": ">=",
                    "right": {"type": "value", "value": 70}
                }
            }]
        }),
        ("Bollinger Bands", {
            "entries": [{
                "side": "LONG",
                "logic": {
                    "left": {"type": "indicator", "id": "CLOSE"},
                    "cmp": "<",
                    "right": {"type": "indicator", "id": "BOLLINGER_LOWER", "params": {"length": 20, "mult": 2.0}}
                }
            }],
            "exits": [{
                "side": "LONG",
                "logic": {
                    "left": {"type": "indicator", "id": "CLOSE"},
                    "cmp": ">=",
                    "right": {"type": "indicator", "id": "BOLLINGER_MIDDLE", "params": {"length": 20, "mult": 2.0}}
                }
            }]
        })
    ]
    
    print("Estrategias a comparar:")
    for name, rules in strategies:
        print(f"  • {name}")
        print(f"    Entrada: {len(rules['entries'])} regla(s)")
        print(f"    Salida: {len(rules['exits'])} regla(s)")
    
    return strategies

# ---------- EJEMPLO 6: API Usage Examples ----------
def api_usage_examples():
    """Ejemplos de uso de la API"""
    print("\n=== Ejemplos de Uso de API ===")
    
    base_url = "http://localhost:8000"
    
    # 1. Listar indicadores disponibles
    print("1. GET /indicators")
    print(f"   URL: {base_url}/indicators")
    print("   Respuesta: Lista de indicadores con parámetros")
    
    # 2. Ejecutar backtest
    print("\n2. POST /backtest")
    print(f"   URL: {base_url}/backtest")
    print("   Body: strategy_json con reglas completas")
    
    # 3. Optimización por grid
    print("\n3. POST /optimize")
    print(f"   URL: {base_url}/optimize")
    print("   Body: strategy_json + param_grid")
    
    # 4. Walk-forward
    print("\n4. POST /walkforward")
    print(f"   URL: {base_url}/walkforward")
    print("   Body: strategy_json + param_grid + windows")
    
    # Ejemplo de código Python para usar la API
    print("\nCódigo Python para usar la API:")
    print("""
import requests
import json

# Configurar URL base
base_url = "http://localhost:8000"

# Ejemplo de backtest
strategy = {
    "meta": {"name": "Test", "symbol": "ES", "timeframe": "5m"},
    "risk": {...},
    "stops_targets": {...},
    "entries": [...],
    "exits": [...]
}

response = requests.post(f"{base_url}/backtest", json={
    "base_path": "/data/ohlcv",
    "strategy_json": strategy
})

result = response.json()
print(f"Sharpe Ratio: {result['metrics']['Sharpe Ratio']}")
print(f"Total Return: {result['metrics']['Total Return %']:.2f}%")
""")

# ---------- EJEMPLO 7: Mini-prácticas ----------
def mini_practices():
    """Mini-prácticas para afianzar conocimientos"""
    print("\n=== Mini-prácticas ===")
    
    practices = [
        {
            "title": "Smoke Test",
            "description": "Ejecuta /backtest con estrategia base y verifica que metrics incluye las 8 métricas principales",
            "metrics": ["Total Return", "CAGR", "Sharpe Ratio", "Max Drawdown", "Win Rate", "Profit Factor", "Avg Trade", "Expectancy"]
        },
        {
            "title": "Grid Pequeño",
            "description": "Prueba /optimize con 2×2×2 combinaciones y guarda los mejores parámetros",
            "example": {
                "EMA_fast": [8, 12],
                "EMA_slow": [20, 26],
                "RSI_threshold": [25, 30]
            }
        },
        {
            "title": "Walk-forward",
            "description": "Define 3 ventanas trimestrales en 2021; compara Sharpe OOS vs in-sample",
            "windows": [
                {"train": "2021-Q1", "test": "2021-Q2"},
                {"train": "2021-Q2", "test": "2021-Q3"},
                {"train": "2021-Q3", "test": "2021-Q4"}
            ]
        },
        {
            "title": "Análisis de Métricas",
            "description": "¿Qué significa Profit Factor 1.8, Win Rate 40% y Expectancy positiva?",
            "answer": "Asimetría riesgo/beneficio: pocas ganancias grandes compensan muchas pérdidas pequeñas"
        }
    ]
    
    for i, practice in enumerate(practices, 1):
        print(f"{i}. {practice['title']}")
        print(f"   {practice['description']}")
        if "metrics" in practice:
            print(f"   Métricas: {', '.join(practice['metrics'])}")
        if "example" in practice:
            print(f"   Ejemplo: {practice['example']}")
        if "answer" in practice:
            print(f"   Respuesta: {practice['answer']}")
        print()

# ---------- FUNCIÓN PRINCIPAL ----------
def run_all_examples():
    """Ejecutar todos los ejemplos"""
    print("🚀 TradeLab Engine - Ejemplos Avanzados")
    print("=" * 50)
    
    run_grid_optimization_example()
    run_walkforward_example()
    analyze_metrics_example()
    compare_optimized_strategies()
    api_usage_examples()
    mini_practices()
    
    print("\n✅ Todos los ejemplos completados!")
    print("\nPróximos pasos sugeridos:")
    print("1. Implementar soporte para múltiples posiciones simultáneas")
    print("2. Añadir trailing stops (por ATR/por %)")
    print("3. Incluir indicadores adicionales (MACD, Ichimoku)")
    print("4. Implementar batch multi-símbolo con agregación de equity")

if __name__ == "__main__":
    run_all_examples()
