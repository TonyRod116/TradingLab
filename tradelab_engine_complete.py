# tradelab_engine_complete.py
import math
import json
from dataclasses import dataclass
from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import itertools
from concurrent.futures import ProcessPoolExecutor
import multiprocessing as mp

# ---------- data.py ----------
def load_parquet(symbol: str, timeframe: str, base_path: str) -> pd.DataFrame:
    """
    Espera ficheros por símbolo/timeframe. Ej: {base_path}/ES/5m.parquet
    Columnas requeridas: ['timestamp','open','high','low','close','volume']
    timestamp en tz-aware o naive; se setea como índice DateTimeIndex.
    """
    path = f"{base_path}/{symbol}/{timeframe}.parquet"
    df = pd.read_parquet(path)
    if "timestamp" in df.columns:
        df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True, errors="coerce")
        df = df.set_index("timestamp").sort_index()
    else:
        if not isinstance(df.index, pd.DatetimeIndex):
            raise ValueError("Se requiere timestamp o índice datetime")
        df = df.sort_index()
    # Limpieza básica
    return df[["open","high","low","close","volume"]].dropna()

# ---------- indicators.py ----------
class Indicators:
    @staticmethod
    def SMA(series: pd.Series, length: int) -> pd.Series:
        return series.rolling(length, min_periods=length).mean()

    @staticmethod
    def EMA(series: pd.Series, length: int) -> pd.Series:
        return series.ewm(span=length, adjust=False, min_periods=length).mean()

    @staticmethod
    def RSI(series: pd.Series, length: int=14) -> pd.Series:
        delta = series.diff()
        up = delta.clip(lower=0)
        down = -delta.clip(upper=0)
        roll_up = up.ewm(alpha=1/length, adjust=False).mean()
        roll_down = down.ewm(alpha=1/length, adjust=False).mean()
        rs = roll_up / (roll_down.replace(0, np.nan))
        rsi = 100 - (100 / (1 + rs))
        return rsi.fillna(50)

    @staticmethod
    def ATR(high: pd.Series, low: pd.Series, close: pd.Series, length: int=14) -> pd.Series:
        prev_close = close.shift(1)
        tr = pd.concat([
            (high - low),
            (high - prev_close).abs(),
            (low - prev_close).abs()
        ], axis=1).max(axis=1)
        return tr.ewm(alpha=1/length, adjust=False).mean()

    @staticmethod
    def Bollinger(series: pd.Series, length: int=20, mult: float=2.0) -> Tuple[pd.Series,pd.Series,pd.Series]:
        m = Indicators.SMA(series, length)
        sd = series.rolling(length, min_periods=length).std()
        upper = m + mult*sd
        lower = m - mult*sd
        return upper, m, lower

    @staticmethod
    def VWAP(high: pd.Series, low: pd.Series, close: pd.Series, volume: pd.Series) -> pd.Series:
        typical = (high + low + close)/3.0
        cum_vol = volume.cumsum()
        cum_tpv = (typical*volume).cumsum()
        return cum_tpv / cum_vol.replace(0, np.nan)

    @staticmethod
    def CCI(high: pd.Series, low: pd.Series, close: pd.Series, length: int=20) -> pd.Series:
        typical = (high + low + close) / 3
        sma = typical.rolling(length, min_periods=length).mean()
        mad = typical.rolling(length, min_periods=length).apply(lambda x: np.mean(np.abs(x - x.mean())))
        cci = (typical - sma) / (0.015 * mad)
        return cci.fillna(0)

    @staticmethod
    def Stochastic(high: pd.Series, low: pd.Series, close: pd.Series, k_period: int=14, d_period: int=3) -> Tuple[pd.Series, pd.Series]:
        lowest_low = low.rolling(k_period, min_periods=k_period).min()
        highest_high = high.rolling(k_period, min_periods=k_period).max()
        k_percent = 100 * (close - lowest_low) / (highest_high - lowest_low)
        d_percent = k_percent.rolling(d_period, min_periods=d_period).mean()
        return k_percent.fillna(50), d_percent.fillna(50)

    @staticmethod
    def Williams_R(high: pd.Series, low: pd.Series, close: pd.Series, length: int=14) -> pd.Series:
        highest_high = high.rolling(length, min_periods=length).max()
        lowest_low = low.rolling(length, min_periods=length).min()
        wr = -100 * (highest_high - close) / (highest_high - lowest_low)
        return wr.fillna(-50)

    @staticmethod
    def OBV(close: pd.Series, volume: pd.Series) -> pd.Series:
        price_change = close.diff()
        obv = np.where(price_change > 0, volume, 
                      np.where(price_change < 0, -volume, 0)).cumsum()
        return pd.Series(obv, index=close.index)

    @staticmethod
    def AD_Line(high: pd.Series, low: pd.Series, close: pd.Series, volume: pd.Series) -> pd.Series:
        clv = ((close - low) - (high - close)) / (high - low)
        clv = clv.fillna(0)  # Handle division by zero
        ad = (clv * volume).cumsum()
        return ad

# ---------- rules.py ----------
CMP_FUN = {
    ">":  lambda a,b: a >  b,
    "<":  lambda a,b: a <  b,
    "==": lambda a,b: a == b,
    ">=": lambda a,b: a >= b,
    "<=": lambda a,b: a <= b,
}

def ensure_series(x, index):
    if isinstance(x, (int,float,np.floating)) or x is None:
        return pd.Series(x, index=index)
    return x

def compute_indicator(df: pd.DataFrame, id: str, params: Dict[str,Any]) -> pd.Series:
    idu = id.upper()
    if idu == "CLOSE": return df["close"]
    if idu == "OPEN":  return df["open"]
    if idu == "HIGH":  return df["high"]
    if idu == "LOW":   return df["low"]
    if idu == "VOLUME":return df["volume"]

    if idu == "SMA":   return Indicators.SMA(df["close"], int(params.get("length",20)))
    if idu == "EMA":   return Indicators.EMA(df["close"], int(params.get("length",20)))
    if idu == "RSI":   return Indicators.RSI(df["close"], int(params.get("length",14)))
    if idu == "ATR":   return Indicators.ATR(df["high"], df["low"], df["close"], int(params.get("length",14)))
    if idu == "BOLLINGER_UPPER":
        u,_,_ = Indicators.Bollinger(df["close"], int(params.get("length",20)), float(params.get("mult",2.0))); return u
    if idu == "BOLLINGER_MIDDLE":
        _,m,_ = Indicators.Bollinger(df["close"], int(params.get("length",20)), float(params.get("mult",2.0))); return m
    if idu == "BOLLINGER_LOWER":
        _,_,l = Indicators.Bollinger(df["close"], int(params.get("length",20)), float(params.get("mult",2.0))); return l
    if idu == "VWAP":  return Indicators.VWAP(df["high"], df["low"], df["close"], df["volume"])
    if idu == "CCI":   return Indicators.CCI(df["high"], df["low"], df["close"], int(params.get("length",20)))
    if idu == "STOCH_K":
        k, _ = Indicators.Stochastic(df["high"], df["low"], df["close"], 
                                    int(params.get("k_period",14)), int(params.get("d_period",3)))
        return k
    if idu == "STOCH_D":
        _, d = Indicators.Stochastic(df["high"], df["low"], df["close"], 
                                    int(params.get("k_period",14)), int(params.get("d_period",3)))
        return d
    if idu == "WILLIAMS_R": return Indicators.Williams_R(df["high"], df["low"], df["close"], int(params.get("length",14)))
    if idu == "OBV":   return Indicators.OBV(df["close"], df["volume"])
    if idu == "AD_LINE": return Indicators.AD_Line(df["high"], df["low"], df["close"], df["volume"])
    
    raise ValueError(f"Indicador no soportado: {id}")

def materialize_operand(df: pd.DataFrame, operand: Dict[str,Any]) -> pd.Series:
    if operand["type"] == "indicator":
        return compute_indicator(df, operand["id"], operand.get("params",{}))
    elif operand["type"] == "value":
        return pd.Series(float(operand["value"]), index=df.index)
    else:
        raise ValueError("operand.type debe ser indicator|value")

def eval_logic(df: pd.DataFrame, node: Dict[str,Any]) -> pd.Series:
    """
    node: 
      - comparador simple: {left, cmp, right}
      - compuesto: {op: AND|OR, clauses: [ ... ]}
    Devuelve Serie booleana indexada por time.
    """
    if "op" in node:
        op = node["op"].upper()
        masks = [eval_logic(df, c) for c in node.get("clauses",[])]
        if not masks:
            return pd.Series(False, index=df.index)
        out = masks[0].astype(bool)
        for m in masks[1:]:
            if op == "AND": out = out & m.astype(bool)
            elif op == "OR": out = out | m.astype(bool)
            else: raise ValueError("op debe ser AND/OR")
        return out
    else:
        left = materialize_operand(df, node["left"])
        right = materialize_operand(df, node["right"])
        cmp_fn = CMP_FUN[node["cmp"]]
        return cmp_fn(left, right).fillna(False)

# ---------- exec.py ----------
@dataclass
class RiskConfig:
    initial_capital: float
    position_size: int
    max_positions: int
    commission_round_turn: float
    slippage_ticks: float
    tick_value: float
    tick_size: float

@dataclass
class StopTarget:
    type: str   # "Percentage"|"Points"|"Ticks"|"ATR"
    value: float

@dataclass
class TrailingStop:
    type: str   # "Percentage"|"Points"|"Ticks"|"ATR"
    value: float
    activation_type: str  # "Percentage"|"Points"|"Ticks"|"ATR"
    activation_value: float

def price_with_slippage(fill_price: float, side: str, slippage_ticks: float, tick_size: float, direction: int) -> float:
    """
    direction: +1 para entrada, -1 para salida (permite sesgo si quieres)
    """
    slip = slippage_ticks * tick_size
    if side.upper() == "LONG":
        return fill_price + direction*slip
    else:
        return fill_price - direction*slip

def to_points(value: float, typ: str, context: Dict[str,Any]) -> float:
    """
    Convierte un stop/target a puntos de precio.
    context: {'entry':float, 'atr':float, 'tick_size':float}
    """
    typu = typ.upper()
    if typu == "PERCENTAGE":
        return context["entry"] * (value/100.0)
    if typu == "POINTS":
        return value
    if typu == "TICKS":
        return value * context["tick_size"]
    if typu == "ATR":
        return value * context["atr"]
    raise ValueError("Tipo de stop/target no soportado")

# ---------- backtest.py ----------
class BacktestResult(BaseModel):
    trades: List[Dict[str,Any]]
    equity_curve: List[Dict[str,Any]]
    metrics: Dict[str,Any]

def compute_metrics(equity: pd.Series, trades: List[Dict[str,Any]], rf: float=0.0) -> Dict[str,Any]:
    ret = equity.pct_change().fillna(0.0)
    if (equity.index[-1]-equity.index[0]).days <= 0:
        years = 1.0
    else:
        years = (equity.index[-1]-equity.index[0]).days/365.25
    
    total_return = equity.iloc[-1]/equity.iloc[0]-1.0
    cagr = (1+total_return)**(1/years)-1 if years>0 else total_return
    vol = ret.std()*np.sqrt(252)
    sharpe = (ret.mean()*252 - rf)/vol if vol>0 else 0.0
    
    peak = equity.cummax()
    dd = (equity/peak - 1.0)
    maxdd = dd.min()
    
    # Métricas adicionales basadas en trades
    if trades:
        pnls = [t["pnl"] for t in trades]
        winning_trades = [p for p in pnls if p > 0]
        losing_trades = [p for p in pnls if p < 0]
        
        win_rate = len(winning_trades) / len(trades) if trades else 0
        avg_win = np.mean(winning_trades) if winning_trades else 0
        avg_loss = np.mean(losing_trades) if losing_trades else 0
        profit_factor = abs(sum(winning_trades) / sum(losing_trades)) if losing_trades and sum(losing_trades) != 0 else float('inf')
        expectancy = np.mean(pnls) if pnls else 0
        avg_trade = expectancy  # Alias para compatibilidad
        
        largest_win = max(winning_trades) if winning_trades else 0
        largest_loss = min(losing_trades) if losing_trades else 0
        
        # Consecutive wins/losses
        consecutive_wins = 0
        consecutive_losses = 0
        max_consecutive_wins = 0
        max_consecutive_losses = 0
        
        for pnl in pnls:
            if pnl > 0:
                consecutive_wins += 1
                consecutive_losses = 0
                max_consecutive_wins = max(max_consecutive_wins, consecutive_wins)
            else:
                consecutive_losses += 1
                consecutive_wins = 0
                max_consecutive_losses = max(max_consecutive_losses, consecutive_losses)
    else:
        win_rate = 0
        avg_win = 0
        avg_loss = 0
        profit_factor = 0
        expectancy = 0
        avg_trade = 0
        largest_win = 0
        largest_loss = 0
        max_consecutive_wins = 0
        max_consecutive_losses = 0
    
    return {
        "Total Return": total_return,
        "Total Return %": total_return * 100,
        "CAGR": cagr,
        "CAGR %": cagr * 100,
        "Sharpe Ratio": sharpe,
        "Max Drawdown": float(maxdd),
        "Max Drawdown %": float(maxdd) * 100,
        "Win Rate": win_rate,
        "Win Rate %": win_rate * 100,
        "Profit Factor": profit_factor,
        "Expectancy": expectancy,
        "Avg Trade": avg_trade,  # Nueva métrica añadida
        "Average Win": avg_win,
        "Average Loss": avg_loss,
        "Largest Win": largest_win,
        "Largest Loss": largest_loss,
        "Total Trades": len(trades),
        "Winning Trades": len(winning_trades) if trades else 0,
        "Losing Trades": len(losing_trades) if trades else 0,
        "Max Consecutive Wins": max_consecutive_wins,
        "Max Consecutive Losses": max_consecutive_losses,
        "Volatility": vol,
        "Volatility %": vol * 100
    }

class Backtester:
    def __init__(self, df: pd.DataFrame, risk: RiskConfig, stops: Optional[StopTarget], targets: Optional[StopTarget]):
        self.df = df.copy()
        self.risk = risk
        self.stops = stops
        self.targets = targets

    def run(self, entries: List[Dict[str,Any]], exits: List[Dict[str,Any]]) -> BacktestResult:
        df = self.df
        # Precomputar ATR para stops ATR si es necesario
        df["_ATR14"] = Indicators.ATR(df["high"], df["low"], df["close"], 14)
        
        # Señales
        long_entry = pd.Series(False, index=df.index)
        short_entry = pd.Series(False, index=df.index)
        long_exit = pd.Series(False, index=df.index)
        short_exit = pd.Series(False, index=df.index)

        for r in entries:
            side = r["side"].upper()
            mask = eval_logic(df, r["logic"])
            if side == "LONG": long_entry |= mask
            if side == "SHORT": short_entry |= mask

        for r in exits:
            side = r["side"].upper()
            mask = eval_logic(df, r["logic"])
            if side == "LONG": long_exit |= mask
            if side == "SHORT": short_exit |= mask

        # Estado
        equity = []
        trades = []
        cash = self.risk.initial_capital
        pos_side = None   # "LONG"|"SHORT"|None
        pos_size = 0
        entry_price = None
        entry_time = None
        commission = self.risk.commission_round_turn
        tick_size = self.risk.tick_size
        tick_value = self.risk.tick_value

        for ts, row in df.iterrows():
            price = row["close"]

            # Salidas por señal o por stops/targets
            if pos_side is not None:
                atr = row["_ATR14"]
                ctx = {"entry": entry_price, "atr": atr, "tick_size": tick_size}
                
                # Calcula niveles (solo una vez por trade)
                if "stop_level" not in locals() or entry_time == ts:  # safe guard
                    stop_level = None
                    target_level = None
                if stop_level is None and self.stops:
                    pts = to_points(self.stops.value, self.stops.type, ctx)
                    stop_level = entry_price - pts if pos_side=="LONG" else entry_price + pts
                if target_level is None and self.targets:
                    pts = to_points(self.targets.value, self.targets.type, ctx)
                    target_level = entry_price + pts if pos_side=="LONG" else entry_price - pts

                exit_by_signal = (pos_side=="LONG" and long_exit.loc[ts]) or (pos_side=="SHORT" and short_exit.loc[ts])
                exit_reason = None

                # Stop/Target intrabar usando OHLC
                hit_price = None
                if pos_side == "LONG":
                    if stop_level is not None and row["low"] <= stop_level:
                        hit_price = stop_level; exit_reason = "stop"
                    elif target_level is not None and row["high"] >= target_level:
                        hit_price = target_level; exit_reason = "target"
                else:
                    if stop_level is not None and row["high"] >= stop_level:
                        hit_price = stop_level; exit_reason = "stop"
                    elif target_level is not None and row["low"] <= target_level:
                        hit_price = target_level; exit_reason = "target"

                # Orden de prioridad: stop/target intrabar > señal
                if hit_price is not None or exit_by_signal:
                    fill = hit_price if hit_price is not None else price
                    # aplica slippage de salida (direction -1)
                    fill = price_with_slippage(fill, pos_side, self.risk.slippage_ticks, tick_size, direction=-1)
                    pl_points = (fill - entry_price) if pos_side=="LONG" else (entry_price - fill)
                    pl_dollars = pl_points / tick_size * tick_value * self.risk.position_size
                    cash += pl_dollars - commission
                    trades.append({
                        "entry_time": entry_time, "entry_price": entry_price,
                        "exit_time": ts, "exit_price": fill,
                        "side": pos_side, "pnl": pl_dollars, "reason": exit_reason or "signal"
                    })
                    pos_side, pos_size, entry_price, entry_time = None, 0, None, None
                    stop_level, target_level = None, None

            # Entradas (si no hay posición)
            if pos_side is None:
                if long_entry.loc[ts]:
                    fill = price_with_slippage(row["close"], "LONG", self.risk.slippage_ticks, tick_size, direction=+1)
                    pos_side = "LONG"; pos_size = self.risk.position_size
                    entry_price = fill; entry_time = ts
                    cash -= commission
                    stop_level, target_level = None, None
                elif short_entry.loc[ts]:
                    fill = price_with_slippage(row["close"], "SHORT", self.risk.slippage_ticks, tick_size, direction=+1)
                    pos_side = "SHORT"; pos_size = self.risk.position_size
                    entry_price = fill; entry_time = ts
                    cash -= commission
                    stop_level, target_level = None, None

            # Equity mark-to-market
            mtm = 0.0
            if pos_side is not None:
                mtm_points = (row["close"] - entry_price) if pos_side=="LONG" else (entry_price - row["close"])
                mtm = mtm_points / tick_size * tick_value * pos_size
            equity.append({"timestamp": ts, "equity": cash + mtm})

        eq = pd.Series([e["equity"] for e in equity], index=[e["timestamp"] for e in equity])
        mets = compute_metrics(eq, trades)
        return BacktestResult(
            trades=trades,
            equity_curve=[{"timestamp": str(t), "equity": float(v)} for t,v in eq.items()],
            metrics=mets
        )

# ---------- walkforward.py ----------
class WalkForwardResult(BaseModel):
    train_results: List[Dict[str,Any]]
    test_results: List[Dict[str,Any]]
    best_params: Dict[str,Any]
    oos_performance: Dict[str,Any]
    oos_equity_curve: List[Dict[str,Any]]
    oos_trades: List[Dict[str,Any]]

def walk_forward_optimization(df: pd.DataFrame, strategy_template: Dict[str,Any], 
                             param_ranges: Dict[str,List], train_months: int=6, 
                             test_months: int=1, step_months: int=1) -> WalkForwardResult:
    """
    Walk-forward optimization con ventanas deslizantes
    """
    start_date = df.index[0]
    end_date = df.index[-1]
    
    train_results = []
    test_results = []
    best_params_history = []
    
    current_date = start_date
    while current_date < end_date:
        train_end = current_date + pd.DateOffset(months=train_months)
        test_start = train_end
        test_end = test_start + pd.DateOffset(months=test_months)
        
        if test_end > end_date:
            break
            
        # Datos de entrenamiento
        train_df = df[(df.index >= current_date) & (df.index < train_end)]
        test_df = df[(df.index >= test_start) & (df.index < test_end)]
        
        if len(train_df) < 100 or len(test_df) < 20:  # Mínimo de datos
            current_date += pd.DateOffset(months=step_months)
            continue
        
        # Optimización en datos de entrenamiento
        best_params = None
        best_sharpe = -float('inf')
        
        # Generar todas las combinaciones de parámetros
        param_names = list(param_ranges.keys())
        param_values = list(param_ranges.values())
        
        for param_combo in itertools.product(*param_values):
            params = dict(zip(param_names, param_combo))
            
            # Crear estrategia con estos parámetros
            strategy = create_strategy_with_params(strategy_template, params)
            
            try:
                # Ejecutar backtest en datos de entrenamiento
                risk = RiskConfig(**strategy["risk"])
                stops = StopTarget(**strategy["stops_targets"]["stop_loss"]) if strategy["stops_targets"].get("stop_loss") else None
                targets = StopTarget(**strategy["stops_targets"]["take_profit"]) if strategy["stops_targets"].get("take_profit") else None
                
                bt = Backtester(train_df, risk, stops, targets)
                result = bt.run(strategy["entries"], strategy["exits"])
                
                sharpe = result.metrics.get("Sharpe Ratio", -float('inf'))
                if sharpe > best_sharpe:
                    best_sharpe = sharpe
                    best_params = params
                    
            except Exception as e:
                continue
        
        if best_params:
            best_params_history.append(best_params)
            
            # Ejecutar con mejores parámetros en datos de test
            strategy = create_strategy_with_params(strategy_template, best_params)
            risk = RiskConfig(**strategy["risk"])
            stops = StopTarget(**strategy["stops_targets"]["stop_loss"]) if strategy["stops_targets"].get("stop_loss") else None
            targets = StopTarget(**strategy["stops_targets"]["take_profit"]) if strategy["stops_targets"].get("take_profit") else None
            
            bt = Backtester(test_df, risk, stops, targets)
            test_result = bt.run(strategy["entries"], strategy["exits"])
            
            train_results.append({
                "period": f"{current_date.strftime('%Y-%m')} to {train_end.strftime('%Y-%m')}",
                "best_params": best_params,
                "best_sharpe": best_sharpe
            })
            
            test_results.append({
                "period": f"{test_start.strftime('%Y-%m')} to {test_end.strftime('%Y-%m')}",
                "metrics": test_result.metrics,
                "trades": len(test_result.trades)
            })
        
        current_date += pd.DateOffset(months=step_months)
    
    # Calcular métricas OOS agregadas
    if test_results:
        all_returns = []
        all_trades = []
        for result in test_results:
            all_returns.append(result["metrics"].get("Total Return", 0))
            all_trades.extend([1] * result["trades"])  # Placeholder para conteo
        
        oos_performance = {
            "Average Return": np.mean(all_returns),
            "Total Return": np.sum(all_returns),
            "Sharpe Ratio": np.mean([r["metrics"].get("Sharpe Ratio", 0) for r in test_results]),
            "Max Drawdown": np.mean([r["metrics"].get("Max Drawdown", 0) for r in test_results]),
            "Total Trades": sum([r["trades"] for r in test_results])
        }
    else:
        oos_performance = {}
    
        # Concatenar equity curves y trades OOS
        oos_equity_curve = []
        oos_trades = []
        
        for result in test_results:
            if "equity_curve" in result:
                oos_equity_curve.extend(result["equity_curve"])
            if "trades" in result:
                oos_trades.extend(result["trades"])
        
        return WalkForwardResult(
            train_results=train_results,
            test_results=test_results,
            best_params=best_params_history[-1] if best_params_history else {},
            oos_performance=oos_performance,
            oos_equity_curve=oos_equity_curve,
            oos_trades=oos_trades
        )

def create_strategy_with_params(template: Dict[str,Any], params: Dict[str,Any]) -> Dict[str,Any]:
    """
    Crea una estrategia reemplazando parámetros en el template
    """
    strategy = json.loads(json.dumps(template))  # Deep copy
    
    # Reemplazar parámetros en las reglas
    for entry in strategy["entries"]:
        replace_params_in_logic(entry["logic"], params)
    
    for exit in strategy["exits"]:
        replace_params_in_logic(exit["logic"], params)
    
    return strategy

def replace_params_in_logic(logic: Dict[str,Any], params: Dict[str,Any]):
    """
    Reemplaza parámetros en la lógica de reglas recursivamente
    """
    if "op" in logic:
        for clause in logic.get("clauses", []):
            replace_params_in_logic(clause, params)
    else:
        if logic["left"]["type"] == "indicator":
            for key, value in params.items():
                if key in logic["left"].get("params", {}):
                    logic["left"]["params"][key] = value
        if logic["right"]["type"] == "indicator":
            for key, value in params.items():
                if key in logic["right"].get("params", {}):
                    logic["right"]["params"][key] = value

# ---------- api.py ----------
class BacktestRequest(BaseModel):
    base_path: str
    strategy_json: Dict[str,Any]

class OptimizationRequest(BaseModel):
    base_path: str
    strategy_json: Dict[str,Any]
    param_grid: Dict[str,List]

class WalkForwardRequest(BaseModel):
    base_path: str
    strategy_json: Dict[str,Any]
    param_grid: Dict[str,List]
    windows: List[Dict[str,str]]

class IndicatorsResponse(BaseModel):
    indicators: Dict[str, Dict[str,Any]]

app = FastAPI(title="TradeLab Engine", version="2.0.0")

@app.get("/indicators", response_model=IndicatorsResponse)
def get_indicators():
    """Lista todos los indicadores soportados con sus parámetros"""
    indicators = {
        "SMA": {"params": ["length"], "defaults": {"length": 20}},
        "EMA": {"params": ["length"], "defaults": {"length": 20}},
        "RSI": {"params": ["length"], "defaults": {"length": 14}},
        "ATR": {"params": ["length"], "defaults": {"length": 14}},
        "BOLLINGER_UPPER": {"params": ["length", "mult"], "defaults": {"length": 20, "mult": 2.0}},
        "BOLLINGER_MIDDLE": {"params": ["length", "mult"], "defaults": {"length": 20, "mult": 2.0}},
        "BOLLINGER_LOWER": {"params": ["length", "mult"], "defaults": {"length": 20, "mult": 2.0}},
        "VWAP": {"params": [], "defaults": {}},
        "CCI": {"params": ["length"], "defaults": {"length": 20}},
        "STOCH_K": {"params": ["k_period", "d_period"], "defaults": {"k_period": 14, "d_period": 3}},
        "STOCH_D": {"params": ["k_period", "d_period"], "defaults": {"k_period": 14, "d_period": 3}},
        "WILLIAMS_R": {"params": ["length"], "defaults": {"length": 14}},
        "OBV": {"params": [], "defaults": {}},
        "AD_LINE": {"params": [], "defaults": {}},
        "CLOSE": {"params": [], "defaults": {}},
        "OPEN": {"params": [], "defaults": {}},
        "HIGH": {"params": [], "defaults": {}},
        "LOW": {"params": [], "defaults": {}},
        "VOLUME": {"params": [], "defaults": {}}
    }
    return IndicatorsResponse(indicators=indicators)

@app.post("/backtest")
def run_backtest(req: BacktestRequest):
    """Ejecuta un backtest con la estrategia proporcionada"""
    try:
        s = req.strategy_json
        df = load_parquet(s["meta"]["symbol"], s["meta"]["timeframe"], req.base_path)
        risk = RiskConfig(**s["risk"])
        stops = StopTarget(**s["stops_targets"]["stop_loss"]) if s["stops_targets"].get("stop_loss") else None
        targets = StopTarget(**s["stops_targets"]["take_profit"]) if s["stops_targets"].get("take_profit") else None
        bt = Backtester(df, risk, stops, targets)
        res = bt.run(entries=s["entries"], exits=s["exits"])
        return res.dict()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/optimize")
def run_optimization(req: OptimizationRequest):
    """Ejecuta optimización por grid de parámetros"""
    try:
        s = req.strategy_json
        df = load_parquet(s["meta"]["symbol"], s["meta"]["timeframe"], req.base_path)
        
        best_params = None
        best_sharpe = -float('inf')
        results = []
        
        # Generar todas las combinaciones de parámetros
        param_names = list(req.param_grid.keys())
        param_values = list(req.param_grid.values())
        
        for param_combo in itertools.product(*param_values):
            params = dict(zip(param_names, param_combo))
            
            # Crear estrategia con estos parámetros
            strategy = create_strategy_with_params(s, params)
            
            try:
                risk = RiskConfig(**strategy["risk"])
                stops = StopTarget(**strategy["stops_targets"]["stop_loss"]) if strategy["stops_targets"].get("stop_loss") else None
                targets = StopTarget(**strategy["stops_targets"]["take_profit"]) if strategy["stops_targets"].get("take_profit") else None
                
                bt = Backtester(df, risk, stops, targets)
                result = bt.run(strategy["entries"], strategy["exits"])
                
                sharpe = result.metrics.get("Sharpe Ratio", -float('inf'))
                results.append({
                    "params": params,
                    "sharpe": sharpe,
                    "total_return": result.metrics.get("Total Return", 0),
                    "max_drawdown": result.metrics.get("Max Drawdown", 0),
                    "win_rate": result.metrics.get("Win Rate", 0),
                    "profit_factor": result.metrics.get("Profit Factor", 0),
                    "trades": len(result.trades)
                })
                
                if sharpe > best_sharpe:
                    best_sharpe = sharpe
                    best_params = params
                    
            except Exception as e:
                continue
        
        return {
            "best_params": best_params,
            "best_sharpe": best_sharpe,
            "all_results": results[:50]  # Limitar a 50 resultados
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/walkforward")
def run_walkforward(req: WalkForwardRequest):
    """Ejecuta optimización walk-forward con ventanas específicas"""
    try:
        s = req.strategy_json
        df = load_parquet(s["meta"]["symbol"], s["meta"]["timeframe"], req.base_path)
        
        train_results = []
        test_results = []
        oos_equity_curve = []
        oos_trades = []
        
        for window in req.windows:
            train_start = pd.to_datetime(window["train_start"])
            train_end = pd.to_datetime(window["train_end"])
            test_start = pd.to_datetime(window["test_start"])
            test_end = pd.to_datetime(window["test_end"])
            
            # Datos de entrenamiento y prueba
            train_df = df[(df.index >= train_start) & (df.index < train_end)]
            test_df = df[(df.index >= test_start) & (df.index < test_end)]
            
            if len(train_df) < 100 or len(test_df) < 20:
                continue
            
            # Optimización en datos de entrenamiento
            best_params = None
            best_sharpe = -float('inf')
            
            param_names = list(req.param_grid.keys())
            param_values = list(req.param_grid.values())
            
            for param_combo in itertools.product(*param_values):
                params = dict(zip(param_names, param_combo))
                strategy = create_strategy_with_params(s, params)
                
                try:
                    risk = RiskConfig(**strategy["risk"])
                    stops = StopTarget(**strategy["stops_targets"]["stop_loss"]) if strategy["stops_targets"].get("stop_loss") else None
                    targets = StopTarget(**strategy["stops_targets"]["take_profit"]) if strategy["stops_targets"].get("take_profit") else None
                    
                    bt = Backtester(train_df, risk, stops, targets)
                    result = bt.run(strategy["entries"], strategy["exits"])
                    
                    sharpe = result.metrics.get("Sharpe Ratio", -float('inf'))
                    if sharpe > best_sharpe:
                        best_sharpe = sharpe
                        best_params = params
                        
                except Exception as e:
                    continue
            
            if best_params:
                # Ejecutar con mejores parámetros en datos de test
                strategy = create_strategy_with_params(s, best_params)
                risk = RiskConfig(**strategy["risk"])
                stops = StopTarget(**strategy["stops_targets"]["stop_loss"]) if strategy["stops_targets"].get("stop_loss") else None
                targets = StopTarget(**strategy["stops_targets"]["take_profit"]) if strategy["stops_targets"].get("take_profit") else None
                
                bt = Backtester(test_df, risk, stops, targets)
                test_result = bt.run(strategy["entries"], strategy["exits"])
                
                train_results.append({
                    "period": f"{train_start.strftime('%Y-%m')} to {train_end.strftime('%Y-%m')}",
                    "best_params": best_params,
                    "best_sharpe": best_sharpe
                })
                
                test_results.append({
                    "period": f"{test_start.strftime('%Y-%m')} to {test_end.strftime('%Y-%m')}",
                    "metrics": test_result.metrics,
                    "trades": len(test_result.trades),
                    "equity_curve": test_result.equity_curve,
                    "trades": test_result.trades
                })
                
                oos_equity_curve.extend(test_result.equity_curve)
                oos_trades.extend(test_result.trades)
        
        # Calcular métricas OOS agregadas
        if test_results:
            all_returns = [r["metrics"].get("Total Return", 0) for r in test_results]
            all_sharpes = [r["metrics"].get("Sharpe Ratio", 0) for r in test_results]
            all_drawdowns = [r["metrics"].get("Max Drawdown", 0) for r in test_results]
            
            oos_performance = {
                "Average Return": np.mean(all_returns),
                "Total Return": np.sum(all_returns),
                "Sharpe Ratio": np.mean(all_sharpes),
                "Max Drawdown": np.mean(all_drawdowns),
                "Total Trades": sum([r["trades"] for r in test_results])
            }
        else:
            oos_performance = {}
        
        return {
            "train_results": train_results,
            "test_results": test_results,
            "best_params": train_results[-1]["best_params"] if train_results else {},
            "oos_performance": oos_performance,
            "oos_equity_curve": oos_equity_curve,
            "oos_trades": oos_trades
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/grid_search")
def run_grid_search(req: BacktestRequest):
    """Ejecuta búsqueda en grid de parámetros (versión simple)"""
    try:
        s = req.strategy_json
        df = load_parquet(s["meta"]["symbol"], s["meta"]["timeframe"], req.base_path)
        
        # Extraer rangos de parámetros del JSON (formato específico)
        param_ranges = s.get("param_ranges", {})
        if not param_ranges:
            raise ValueError("Se requieren param_ranges en el JSON")
        
        best_params = None
        best_sharpe = -float('inf')
        results = []
        
        # Generar todas las combinaciones
        param_names = list(param_ranges.keys())
        param_values = list(param_ranges.values())
        
        for param_combo in itertools.product(*param_values):
            params = dict(zip(param_names, param_combo))
            
            # Crear estrategia con estos parámetros
            strategy = create_strategy_with_params(s, params)
            
            try:
                risk = RiskConfig(**strategy["risk"])
                stops = StopTarget(**strategy["stops_targets"]["stop_loss"]) if strategy["stops_targets"].get("stop_loss") else None
                targets = StopTarget(**strategy["stops_targets"]["take_profit"]) if strategy["stops_targets"].get("take_profit") else None
                
                bt = Backtester(df, risk, stops, targets)
                result = bt.run(strategy["entries"], strategy["exits"])
                
                sharpe = result.metrics.get("Sharpe Ratio", -float('inf'))
                results.append({
                    "params": params,
                    "sharpe": sharpe,
                    "total_return": result.metrics.get("Total Return", 0),
                    "max_drawdown": result.metrics.get("Max Drawdown", 0),
                    "trades": len(result.trades)
                })
                
                if sharpe > best_sharpe:
                    best_sharpe = sharpe
                    best_params = params
                    
            except Exception as e:
                continue
        
        return {
            "best_params": best_params,
            "best_sharpe": best_sharpe,
            "all_results": results[:50]  # Limitar a 50 resultados para evitar respuestas muy grandes
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
