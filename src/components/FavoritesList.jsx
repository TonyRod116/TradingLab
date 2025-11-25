import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaBookmark } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import favoritesService from '../services/FavoritesService';
import StrategyList from './StrategyList';
import './FavoritesList.css';

const FavoritesList = () => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const favoritedStrategies = await favoritesService.getFavorites();
      setFavorites(favoritedStrategies?.results || favoritedStrategies || []);
    } catch (err) {
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

  if (!isAuthenticated) {
    return (
      <div className="favorites-list-empty">
        <div className="empty-state">
          <div className="empty-icon">🔐</div>
          <h3>Please sign in to view favorites</h3>
        </div>
      </div>
    );
  }

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

  return (
    <div className="favorites-list-wrapper">
      <div className="favorites-list-header">
        <h2>
          <FaBookmark className="header-icon" />
          My Favorites ({favorites.length})
        </h2>
      </div>
      <StrategyList
        strategies={favorites}
        loading={loading}
        error={error}
        showUserInfo={true}
      />
    </div>
  );
};

export default FavoritesList;
