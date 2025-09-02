import React, { useState } from 'react';
import { FaChartLine, FaTrophy, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import './BacktestResults.css';

const BacktestResults = ({ results, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  


  if (!results) return null;

  const { performance, trades, summary, strategy } = results;

  const renderOverview = () => (
    <div className="results-overview">
      <div className="performance-summary">
        <div className="summary-card main">
          <div className="summary-header">
            <h3>Strategy Performance</h3>
            <div className={`rating-badge ${summary.rating.toLowerCase()}`} style={{ color: summary.color }}>
              <FaTrophy />
              {summary.rating}
            </div>
          </div>
          
          <div className="key-metrics">
            <div className="metric-card">
              <div className="metric-label">Total Return</div>
              <div className={`metric-value ${performance.total_return >= 0 ? 'positive' : 'negative'}`}>
                {performance.total_return >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                ${performance.total_return.toFixed(2)}
              </div>
              <div className="metric-percent">
                {performance.total_return_percent.toFixed(2)}%
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-label">Win Rate</div>
              <div className="metric-value">
                {performance.win_rate.toFixed(1)}%
              </div>
              <div className="metric-detail">
                {performance.winning_trades}/{performance.total_trades} trades
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-label">Sharpe Ratio</div>
              <div className="metric-value">
                {performance.sharpe_ratio ? performance.sharpe_ratio.toFixed(2) : 'N/A'}
              </div>
              <div className="metric-detail">
                Risk-adjusted return
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-label">Max Drawdown</div>
              <div className="metric-value negative">
                <FaArrowDown />
                ${performance.max_drawdown.toFixed(2)}
              </div>
              <div className="metric-percent">
                {performance.max_drawdown_percent.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="detailed-metrics">
        <div className="metrics-grid">
          <div className="metric-item">
            <span className="label">Profit Factor:</span>
            <span className="value">{performance.profit_factor.toFixed(2)}</span>
          </div>
          <div className="metric-item">
            <span className="label">Total Trades:</span>
            <span className="value">{performance.total_trades}</span>
          </div>
          <div className="metric-item">
            <span className="label">Winning Trades:</span>
            <span className="value positive">{performance.winning_trades}</span>
          </div>
          <div className="metric-item">
            <span className="label">Losing Trades:</span>
            <span className="value negative">{performance.losing_trades}</span>
          </div>
          <div className="metric-item">
            <span className="label">Average Win:</span>
            <span className="value positive">${performance.avg_win.toFixed(2)}</span>
          </div>
          <div className="metric-item">
            <span className="label">Average Loss:</span>
            <span className="value negative">${performance.avg_loss.toFixed(2)}</span>
          </div>
          <div className="metric-item">
            <span className="label">Largest Win:</span>
            <span className="value positive">${performance.largest_win.toFixed(2)}</span>
          </div>
          <div className="metric-item">
            <span className="label">Largest Loss:</span>
            <span className="value negative">${performance.largest_loss.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrades = () => (
    <div className="trades-section">
      <div className="trades-header">
        <h3>Trade History</h3>
        <span className="trades-count">{trades.length} trades</span>
      </div>
      
      <div className="trades-table">
        <div className="table-header">
          <span>Date</span>
          <span>Action</span>
          <span>Entry</span>
          <span>Exit</span>
          <span>P&L</span>
          <span>Reason</span>
        </div>
        
        {trades.map((trade, index) => (
          <div key={trade.id || index} className={`table-row ${trade.pnl >= 0 ? 'winning' : 'losing'}`}>
            <span>{new Date(trade.entry_date).toLocaleDateString()}</span>
            <span className={`action ${trade.action}`}>
              {trade.action === 'buy' ? 'Long' : 'Short'}
            </span>
            <span>${trade.entry_price.toFixed(2)}</span>
            <span>${trade.exit_price.toFixed(2)}</span>
            <span className={`pnl ${trade.pnl >= 0 ? 'positive' : 'negative'}`}>
              {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
            </span>
            <span className="reason">{trade.reason}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCharts = () => (
    <div className="charts-section">
      <div className="chart-placeholder">
        <FaChartLine className="chart-icon" />
        <h3>Equity Curve</h3>
        <p>Chart visualization would go here</p>
        <div className="chart-info">
          <div className="info-item">
            <span className="label">Initial Capital:</span>
            <span className="value">${results.settings.initial_capital.toLocaleString()}</span>
          </div>
          <div className="info-item">
            <span className="label">Final Capital:</span>
            <span className="value">${(results.settings.initial_capital + performance.total_return).toLocaleString()}</span>
          </div>
          <div className="info-item">
            <span className="label">Commission:</span>
            <span className="value">${results.settings.commission} per round turn</span>
          </div>
          <div className="info-item">
            <span className="label">Slippage:</span>
            <span className="value">{results.settings.slippage} points</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabs = () => (
    <div className="results-tabs">
      <button
        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
        onClick={() => setActiveTab('overview')}
      >
        <FaTrophy />
        Overview
      </button>
      <button
        className={`tab-btn ${activeTab === 'trades' ? 'active' : ''}`}
        onClick={() => setActiveTab('trades')}
      >
        <FaChartLine />
        Trades ({trades.length})
      </button>
      <button
        className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
        onClick={() => setActiveTab('charts')}
      >
        <FaChartLine />
        Charts
      </button>
    </div>
  );

  return (
    <div className="backtest-results">
      <div className="results-header">
        <div className="header-info">
          <h2>Backtest Results</h2>
          <p>{strategy.name}</p>
        </div>
        <button className="close-btn" onClick={onClose}>
          <FaTimesCircle />
        </button>
      </div>

      {renderTabs()}

      <div className="results-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'trades' && renderTrades()}
        {activeTab === 'charts' && renderCharts()}
      </div>

      <div className="results-footer">
        <div className="footer-info">
          <span>Backtest completed on {new Date(results.timestamp).toLocaleString()}</span>
        </div>
        <div className="footer-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary">
            Save Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default BacktestResults;
