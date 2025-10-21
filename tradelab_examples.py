# tradelab_examples.py
"""
Ejemplos de uso del motor de backtesting TradeLab
Incluye estrategias de ejemplo y casos de uso comunes
"""

import json
from tradelab_engine_complete import (
    load_parquet, RiskConfig, StopTarget, Backtester,
    walk_forward_optimization, create_strategy_with_params
)

# ---------- EJEMPLO 1: EMA Cross con filtro RSI ----------
def create_ema_cross_rsi_strategy():
    """Estrategia: EMA12 > EMA26 AND RSI14 <= 30 para entrar long"""
    return {
        "meta": {
            "name": "EMA Cross con RSI",
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
        "exits": [{
            "side": "LONG",
            "logic": {
                "op": "OR",
                "clauses": [
                    {
                        "left": {"type": "indicator", "id": "RSI", "params": {"length": 14}},
                        "cmp": ">=",
                        "right": {"type": "value", "value": 70}
                    }
                ]
            }
        }]
    }

# ---------- EJEMPLO 2: Bollinger Bands Mean Reversion ----------
def create_bollinger_mean_reversion_strategy():
    """Estrategia: Close < Bollinger Lower para entrar long"""
    return {
        "meta": {
            "name": "Bollinger Mean Reversion",
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
            "stop_loss": {"type": "Points", "value": 2.0},
            "take_profit": {"type": "Points", "value": 3.0}
        },
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
    }

# ---------- EJEMPLO 3: VWAP Strategy ----------
def create_vwap_strategy():
    """Estrategia: Close > VWAP para entrar long"""
    return {
        "meta": {
            "name": "VWAP Trend Following",
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
            "stop_loss": {"type": "Percentage", "value": 1.0},
            "take_profit": {"type": "Percentage", "value": 2.0}
        },
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
        "exits": [{
            "side": "LONG",
            "logic": {
                "left": {"type": "indicator", "id": "CLOSE"},
                "cmp": "<",
                "right": {"type": "indicator", "id": "VWAP"}
            }
        }]
    }

# ---------- EJEMPLO 4: Multi-Indicator Strategy ----------
def create_multi_indicator_strategy():
    """Estrategia compleja con múltiples indicadores"""
    return {
        "meta": {
            "name": "Multi-Indicator Strategy",
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
                        "left": {"type": "indicator", "id": "STOCH_K", "params": {"k_period": 14, "d_period": 3}},
                        "cmp": ">",
                        "right": {"type": "value", "value": 20}
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
                    }
                ]
            }
        }]
    }

# ---------- FUNCIONES DE EJEMPLO ----------
def run_single_backtest_example():
    """Ejemplo básico de backtest"""
    print("=== Ejemplo de Backtest Individual ===")
    
    # Cargar datos (ajusta la ruta según tu estructura)
    base_path = "/data/ohlcv"  # Cambia por tu ruta
    symbol = "ES"
    timeframe = "5m"
    
    try:
        df = load_parquet(symbol, timeframe, base_path)
        print(f"Datos cargados: {len(df)} barras desde {df.index[0]} hasta {df.index[-1]}")
        
        # Crear estrategia
        strategy = create_ema_cross_rsi_strategy()
        
        # Configurar riesgo
        risk = RiskConfig(**strategy["risk"])
        stops = StopTarget(**strategy["stops_targets"]["stop_loss"])
        targets = StopTarget(**strategy["stops_targets"]["take_profit"])
        
        # Ejecutar backtest
        bt = Backtester(df, risk, stops, targets)
        result = bt.run(strategy["entries"], strategy["exits"])
        
        # Mostrar resultados
        print(f"\nResultados de {strategy['meta']['name']}:")
        print(f"Total Return: {result.metrics['Total Return %']:.2f}%")
        print(f"CAGR: {result.metrics['CAGR %']:.2f}%")
        print(f"Sharpe Ratio: {result.metrics['Sharpe Ratio']:.2f}")
        print(f"Max Drawdown: {result.metrics['Max Drawdown %']:.2f}%")
        print(f"Win Rate: {result.metrics['Win Rate %']:.2f}%")
        print(f"Profit Factor: {result.metrics['Profit Factor']:.2f}")
        print(f"Total Trades: {result.metrics['Total Trades']}")
        
        return result
        
    except FileNotFoundError:
        print(f"Error: No se encontraron datos en {base_path}/{symbol}/{timeframe}.parquet")
        print("Asegúrate de tener datos OHLCV en formato Parquet")
        return None
    except Exception as e:
        print(f"Error ejecutando backtest: {e}")
        return None

def run_optimization_example():
    """Ejemplo de optimización de parámetros"""
    print("\n=== Ejemplo de Optimización ===")
    
    base_path = "/data/ohlcv"
    symbol = "ES"
    timeframe = "5m"
    
    try:
        df = load_parquet(symbol, timeframe, base_path)
        
        # Template de estrategia con parámetros a optimizar
        strategy_template = {
            "meta": {
                "name": "EMA Cross Optimizado",
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
                            "left": {"type": "indicator", "id": "EMA", "params": {"length": "ema_fast"}},
                            "cmp": ">",
                            "right": {"type": "indicator", "id": "EMA", "params": {"length": "ema_slow"}}
                        },
                        {
                            "left": {"type": "indicator", "id": "RSI", "params": {"length": "rsi_length"}},
                            "cmp": "<=",
                            "right": {"type": "value", "value": "rsi_threshold"}
                        }
                    ]
                }
            }],
            "exits": [{
                "side": "LONG",
                "logic": {
                    "left": {"type": "indicator", "id": "RSI", "params": {"length": "rsi_length"}},
                    "cmp": ">=",
                    "right": {"type": "value", "value": 70}
                }
            }]
        }
        
        # Rangos de parámetros a probar
        param_ranges = {
            "ema_fast": [8, 12, 16, 20],
            "ema_slow": [20, 26, 30, 34],
            "rsi_length": [10, 14, 18, 22],
            "rsi_threshold": [25, 30, 35, 40]
        }
        
        # Ejecutar optimización walk-forward
        result = walk_forward_optimization(
            df, strategy_template, param_ranges,
            train_months=3, test_months=1, step_months=1
        )
        
        print(f"Mejores parámetros encontrados: {result.best_params}")
        print(f"Rendimiento OOS promedio: {result.oos_performance}")
        
        return result
        
    except Exception as e:
        print(f"Error en optimización: {e}")
        return None

def compare_strategies():
    """Comparar múltiples estrategias"""
    print("\n=== Comparación de Estrategias ===")
    
    base_path = "/data/ohlcv"
    symbol = "ES"
    timeframe = "5m"
    
    try:
        df = load_parquet(symbol, timeframe, base_path)
        
        strategies = [
            ("EMA Cross RSI", create_ema_cross_rsi_strategy()),
            ("Bollinger Mean Reversion", create_bollinger_mean_reversion_strategy()),
            ("VWAP Trend Following", create_vwap_strategy()),
            ("Multi-Indicator", create_multi_indicator_strategy())
        ]
        
        results = []
        
        for name, strategy in strategies:
            try:
                risk = RiskConfig(**strategy["risk"])
                stops = StopTarget(**strategy["stops_targets"]["stop_loss"])
                targets = StopTarget(**strategy["stops_targets"]["take_profit"])
                
                bt = Backtester(df, risk, stops, targets)
                result = bt.run(strategy["entries"], strategy["exits"])
                
                results.append({
                    "name": name,
                    "total_return": result.metrics["Total Return %"],
                    "sharpe": result.metrics["Sharpe Ratio"],
                    "max_dd": result.metrics["Max Drawdown %"],
                    "win_rate": result.metrics["Win Rate %"],
                    "trades": result.metrics["Total Trades"]
                })
                
            except Exception as e:
                print(f"Error con estrategia {name}: {e}")
        
        # Mostrar comparación
        print(f"{'Estrategia':<25} {'Return %':<10} {'Sharpe':<8} {'Max DD %':<10} {'Win Rate %':<12} {'Trades':<8}")
        print("-" * 80)
        
        for result in results:
            print(f"{result['name']:<25} {result['total_return']:<10.2f} {result['sharpe']:<8.2f} "
                  f"{result['max_dd']:<10.2f} {result['win_rate']:<12.2f} {result['trades']:<8}")
        
        return results
        
    except Exception as e:
        print(f"Error en comparación: {e}")
        return None

# ---------- EJEMPLO DE USO CON API ----------
def api_example():
    """Ejemplo de cómo usar la API"""
    print("\n=== Ejemplo de Uso de API ===")
    
    # JSON para enviar a la API
    strategy_json = create_ema_cross_rsi_strategy()
    
    # Agregar rangos de parámetros para grid search
    strategy_json["param_ranges"] = {
        "ema_fast": [8, 12, 16],
        "ema_slow": [20, 26, 30],
        "rsi_threshold": [25, 30, 35]
    }
    
    print("JSON para enviar a /backtest:")
    print(json.dumps(strategy_json, indent=2))
    
    print("\nJSON para enviar a /grid_search:")
    print(json.dumps(strategy_json, indent=2))

if __name__ == "__main__":
    # Ejecutar ejemplos
    run_single_backtest_example()
    run_optimization_example()
    compare_strategies()
    api_example()
