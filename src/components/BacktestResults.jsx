import React from 'react';
import { FaTimes, FaSave, FaChartLine } from 'react-icons/fa';
import './BacktestResults.css';

const BacktestResults = ({ results, onClose, onSaveStrategy }) => {
  if (!results) return null;

  const { performance, trades, summary, warnings, estimation } = results;

  const formatCurrency = (value) => {
    return `$${parseFloat(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maxDigits: 2 })}`;
  };

  const formatPercent = (value) => {
    return `${parseFloat(value || 0).toFixed(2)}%`;
  };

  const formatNumber = (value) => {
    return parseFloat(value || 0).toFixed(2);
  };

  return (
    <div className="backtest-results-overlay">
      <div className="backtest-results-container">
        <div className="results-header">
          <div className="results-title">
            <FaChartLine />
            <h2>Backtest Results</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {warnings && warnings.length > 0 && (
          <div className="warnings-section">
            {warnings.map((warning, index) => (
              <div key={index} className="warning-message">
                {warning}
              </div>
            ))}
          </div>
        )}

        <div className="results-content">
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Total Return</div>
              <div className={`metric-value ${performance?.total_return >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(performance?.total_return)}
              </div>
              <div className={`metric-secondary ${performance?.total_return_percent >= 0 ? 'positive' : 'negative'}`}>
                {formatPercent(performance?.total_return_percent)}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Total Trades</div>
              <div className="metric-value">{performance?.total_trades || 0}</div>
              <div className="metric-secondary">
                {performance?.winning_trades || 0} wins / {performance?.losing_trades || 0} losses
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Win Rate</div>
              <div className="metric-value">{formatPercent(performance?.win_rate)}</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Profit Factor</div>
              <div className="metric-value">{formatNumber(performance?.profit_factor)}</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Max Drawdown</div>
              <div className="metric-value negative">{formatCurrency(performance?.max_drawdown)}</div>
              <div className="metric-secondary">{formatPercent(performance?.max_drawdown_percent)}</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Sharpe Ratio</div>
              <div className="metric-value">{formatNumber(performance?.sharpe_ratio)}</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Avg Win</div>
              <div className="metric-value positive">{formatCurrency(performance?.avg_win)}</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Avg Loss</div>
              <div className="metric-value negative">{formatCurrency(performance?.avg_loss)}</div>
            </div>
          </div>

          {trades && trades.length > 0 && (
            <div className="trades-section">
              <h3>Recent Trades</h3>
              <div className="trades-table-wrapper">
                <table className="trades-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Entry</th>
                      <th>Exit</th>
                      <th>Quantity</th>
                      <th>P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.slice(0, 10).map((trade, index) => (
                      <tr key={index}>
                        <td>{trade.trade_type}</td>
                        <td>{parseFloat(trade.entry_price).toFixed(2)}</td>
                        <td>{parseFloat(trade.exit_price).toFixed(2)}</td>
                        <td>{parseFloat(trade.quantity).toFixed(0)}</td>
                        <td className={parseFloat(trade.net_pnl) >= 0 ? 'positive' : 'negative'}>
                          {formatCurrency(trade.net_pnl)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {trades.length > 10 && (
                <p className="trades-note">Showing 10 of {trades.length} trades</p>
              )}
            </div>
          )}

          {estimation && (
            <div className="estimation-section">
              <p>Backtest completed in approximately {estimation.estimatedTime}</p>
              <p>Processed {estimation.estimatedRows?.toLocaleString()} data points over {estimation.days} days</p>
            </div>
          )}
        </div>

        <div className="results-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-success" onClick={onSaveStrategy}>
            <FaSave />
            Save Strategy
          </button>
        </div>
      </div>
    </div>
  );
};

export default BacktestResults;
