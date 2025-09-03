import React, { useState, useEffect, useCallback } from 'react';
import { FaBookmark, FaTrash, FaEye, FaChartLine } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import favoritesService from '../services/FavoritesService';
import ConfirmDialog from './ConfirmDialog';
import MiniEquityChart from './MiniEquityChart';
import './FavoritesList.css';

const FavoritesList = ({ onRefresh }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    strategyId: null,
    strategyName: ''
  });

  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get all strategies first (same as community backtests)
      const response = await fetch('http://localhost:8000/api/strategies/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const allStrategies = data.results || data;
        
        // Get favorite IDs from localStorage
        const favoriteIds = favoritesService.getLocalFavorites();
        
        // Filter strategies to only include favorited ones
        const favoritedStrategies = allStrategies.filter(strategy => 
          favoriteIds.includes(strategy.id)
        );
        
        setFavorites(favoritedStrategies);
      } else {
        throw new Error('Failed to load strategies');
      }
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError(err.message);
      toast.error('Failed to load favorites', {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleRemoveFavorite = useCallback((strategyId, strategyName, e) => {
    e.stopPropagation();
    
    setConfirmDialog({
      isOpen: true,
      strategyId,
      strategyName
    });
  }, []);

  const confirmRemoveFavorite = useCallback(async () => {
    if (!confirmDialog.strategyId) return;
    
    try {
      await favoritesService.removeFromFavorites(confirmDialog.strategyId);
      setFavorites(prev => prev.filter(strategy => strategy.id !== confirmDialog.strategyId));
      
      toast.success('Removed from favorites!', {
        position: "top-right",
        autoClose: 2000,
      });
      
      // Notify parent component
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error removing favorite:', err);
      toast.error('Failed to remove from favorites', {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setConfirmDialog({
        isOpen: false,
        strategyId: null,
        strategyName: ''
      });
    }
  }, [confirmDialog.strategyId, onRefresh]);

  const cancelRemoveFavorite = useCallback(() => {
    setConfirmDialog({
      isOpen: false,
      strategyId: null,
      strategyName: ''
    });
  }, []);

  const handleStrategyClick = useCallback((strategyId) => {
    navigate(`/backtest/${strategyId}`);
  }, [navigate]);

  const cleanStrategyName = (name) => {
    if (!name) return 'Unnamed Strategy';
    return name
      .replace(/^(temp_backtest_|strategy_)/i, '')
      .replace(/\d{8}T\d{6}/g, '') // Remove timestamps like 20250903T085328
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, '') // Remove ISO timestamps
      .replace(/\d{4}-\d{2}-\d{2}/g, '') // Remove dates like 2025-09-03
      .replace(/\d{8}/g, '') // Remove dates like 20250903
      .replace(/_+/g, ' ') // Replace multiple underscores with single space
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim(); // Remove leading/trailing spaces
  };

  const formatMetric = (value, isPercentage = false, decimals = 2) => {
    if (value === null || value === undefined) return 'N/A';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'N/A';
    
    if (isPercentage) {
      return `${numValue.toFixed(decimals)}%`;
    }
    return numValue.toFixed(decimals);
  };

  if (loading) {
    return (
      <div className="favorites-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading your favorites...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-list-error">
        <p>Error: {error}</p>
        <button onClick={loadFavorites} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="favorites-list-empty">
        <div className="empty-state">
          <div className="empty-icon">🔖</div>
          <h3>No favorites yet</h3>
          <p>Start exploring the community and add strategies you like to your favorites!</p>
          <p className="empty-features">
            <strong>Your favorites will appear here:</strong><br/>
            • Quick access to your preferred strategies<br/>
            • Easy backtesting and analysis<br/>
            • Personal collection of trading ideas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-list">
      <div className="favorites-list-header">
        <h2>
          <FaBookmark className="header-icon" />
          My Favorites ({favorites.length})
        </h2>
        <button onClick={loadFavorites} className="btn btn-secondary">Refresh</button>
      </div>

      <div className="favorites-grid">
        {favorites.map((strategy) => (
          <div key={strategy.id} className="favorite-card" onClick={() => handleStrategyClick(strategy.id)}>
            {/* Mini Equity Chart */}
            <div className="strategy-chart">
              <MiniEquityChart strategy={strategy} height={80} />
            </div>

            <div className="strategy-header">
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
                    if (winRate === null || winRate === undefined) {
                      return 'N/A';
                    }
                    const parsedWinRate = parseFloat(winRate);
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

            <div className="strategy-actions">
              <button
                className="action-button remove-favorite"
                onClick={(e) => handleRemoveFavorite(strategy.id, cleanStrategyName(strategy.name), e)}
                title="Remove from favorites"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={cancelRemoveFavorite}
        onConfirm={confirmRemoveFavorite}
        title="Remove from Favorites"
        message={`Are you sure you want to remove "${confirmDialog.strategyName}" from your favorites?`}
        confirmText="Remove"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
};

export default FavoritesList;
