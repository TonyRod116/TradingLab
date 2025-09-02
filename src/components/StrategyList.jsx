import React, { useState } from 'react';
import { FaPlay, FaPause, FaEdit, FaTrash, FaChartLine, FaEye } from 'react-icons/fa';
import ConfirmDialog from './ConfirmDialog';
import { cleanStrategyName } from '../utils/strategyUtils';
import './StrategyList.css';

const StrategyList = ({ strategies, loading, error, onRefresh }) => {
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    strategyId: null,
    strategyName: ''
  });

  const handleActivate = async (strategyId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/strategies/${strategyId}/activate/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error activating strategy:', err);
    }
  };

  const handlePause = async (strategyId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/strategies/${strategyId}/pause/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error pausing strategy:', err);
    }
  };

  const handleDelete = (strategyId, strategyName) => {
    setConfirmDialog({
      isOpen: true,
      strategyId,
      strategyName: cleanStrategyName(strategyName)
    });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.strategyId) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/strategies/${confirmDialog.strategyId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error deleting strategy:', err);
    } finally {
      setConfirmDialog({
        isOpen: false,
        strategyId: null,
        strategyName: ''
      });
    }
  };

  const cancelDelete = () => {
    setConfirmDialog({
      isOpen: false,
      strategyId: null,
      strategyName: ''
    });
  };

  const handleBacktest = async (strategyId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/strategies/${strategyId}/backtest/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          end_date: new Date().toISOString(),
          initial_capital: 10000.00,
          commission: 0.00,
          slippage: 0.00
        })
      });
      
      if (response.ok) {
        const result = await response.json();

        // Here you could show the backtest results in a modal or navigate to results page
      }
    } catch (err) {
      console.error('Error running backtest:', err);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: 'status-active', text: 'Active' },
      paused: { class: 'status-paused', text: 'Paused' },
      draft: { class: 'status-draft', text: 'Draft' },
      archived: { class: 'status-archived', text: 'Archived' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const getStrategyTypeIcon = (type) => {
    const iconMap = {
      trend_following: '📈',
      mean_reversion: '🔄',
      breakout: '🚀',
      scalping: '⚡',
      custom: '🎯'
    };
    return iconMap[type] || '🎯';
  };

  if (loading) {
    return (
      <div className="strategy-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading strategies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="strategy-list-error">
        <p>Error: {error}</p>
        <button onClick={onRefresh} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  if (strategies.length === 0) {
    return (
      <div className="strategy-list-empty">
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No strategies yet</h3>
          <p>Create your first trading strategy using our advanced Rule Builder!</p>
          <p className="empty-features">
            <strong>Available features:</strong><br/>
            • Technical indicators<br/>
            • Complex conditional rules<br/>
            • Backtesting<br/>
            • Predefined templates
          </p>
        </div>
      </div>
    );
  }



  return (
    <div className="strategy-list">
      <div className="strategy-list-header">
        <h2>Total Strategies: {strategies.length}</h2>
        <button onClick={onRefresh} className="btn btn-secondary">Refresh</button>
      </div>

      <div className="strategies-grid">
        {strategies.map((strategy) => (
          <div key={strategy.id} className="strategy-card">
            <div className="strategy-header">
              <div className="strategy-icon">
                {getStrategyTypeIcon(strategy.strategy_type)}
              </div>
              <div className="strategy-info">
                <h3>{cleanStrategyName(strategy.name)}</h3>
                <p>{strategy.description}</p>
                <div className="strategy-meta">
                  <span className="created-by">by {strategy.created_by || 'Unknown User'}</span>
                  <span className="symbol">{strategy.symbol}</span>
                  <span className="timeframe">{strategy.timeframe}</span>
                </div>
              </div>
            </div>

            <div className="strategy-stats">
              <div className="stat-item">
                <span className="stat-label">Win Rate</span>
                <span className="stat-value">
                  {(() => {
                    const winRate = strategy.win_rate;
                    console.log('Win Rate debug (StrategyList):', { winRate, type: typeof winRate, parsed: parseFloat(winRate) });
                    
                    if (winRate === null || winRate === undefined) {
                      return 'N/A';
                    }
                    
                    const parsedWinRate = parseFloat(winRate);
                    
                    // Check if it's a valid number, not negative, and not greater than 100%
                    if (isNaN(parsedWinRate) || parsedWinRate < 0 || parsedWinRate > 100) {
                      return 'N/A';
                    }
                    
                    return parsedWinRate.toFixed(2) + '%';
                  })()}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Trades</span>
                <span className="stat-value">{strategy.total_trades || 'N/A'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Profit Factor</span>
                <span className="stat-value">{strategy.profit_factor !== null && strategy.profit_factor !== undefined ? parseFloat(strategy.profit_factor).toFixed(2) : '0.00'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Return</span>
                <span className="stat-value">{strategy.total_return_percent ? parseFloat(strategy.total_return_percent).toFixed(2) : 'N/A'}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Max Drawdown</span>
                <span className="stat-value">{strategy.max_drawdown ? parseFloat(strategy.max_drawdown).toFixed(2) : 'N/A'}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Sharpe Ratio</span>
                <span className="stat-value">{strategy.sharpe_ratio ? parseFloat(strategy.sharpe_ratio).toFixed(2) : 'N/A'}</span>
              </div>
            </div>


          </div>
        ))}
      </div>

      {/* Strategy Detail Modal */}
      {selectedStrategy && (
        <div className="modal-overlay" onClick={() => setSelectedStrategy(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedStrategy.name}</h3>
              <button 
                className="modal-close"
                onClick={() => setSelectedStrategy(null)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="strategy-detail-section">
                <h4>Description</h4>
                <p>{selectedStrategy.description}</p>
              </div>
              
              <div className="strategy-detail-section">
                <h4>Configuration</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{selectedStrategy.strategy_type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Symbol:</span>
                    <span className="detail-value">{selectedStrategy.symbol}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Timeframe:</span>
                    <span className="detail-value">{selectedStrategy.timeframe}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Position Size:</span>
                    <span className="detail-value">{selectedStrategy.position_size}</span>
                  </div>
                </div>
              </div>
              
              <div className="strategy-detail-section">
                <h4>Performance</h4>
                <div className="performance-grid">
                  <div className="performance-item">
                    <span className="performance-label">Total Return</span>
                    <span className={`performance-value ${selectedStrategy.total_return >= 0 ? 'positive' : 'negative'}`}>
                      {selectedStrategy.total_return}%
                    </span>
                  </div>
                  <div className="performance-item">
                    <span className="performance-label">Max Drawdown</span>
                    <span className="performance-value negative">
                      {selectedStrategy.max_drawdown}%
                    </span>
                  </div>
                  <div className="performance-item">
                    <span className="performance-label">Sharpe Ratio</span>
                    <span className="performance-value">
                      {selectedStrategy.sharpe_ratio || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => handleBacktest(selectedStrategy.id)}
                className="btn btn-primary"
              >
                Run Backtest
              </button>
              <button 
                onClick={() => setSelectedStrategy(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Strategy"
        message={`Are you sure you want to delete "${confirmDialog.strategyName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default StrategyList;
