import React, { useState, useCallback, useEffect } from 'react';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { toast } from 'react-toastify';
import favoritesService from '../services/FavoritesService';
import './FavoriteButton.css';

const FavoriteButton = ({ strategyId, initialFavorited = false, onToggle, size = 'medium' }) => {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  // Update state when initialFavorited changes
  useEffect(() => {
    setIsFavorited(initialFavorited);
  }, [initialFavorited]);

  const handleToggle = useCallback(async (e) => {
    e.stopPropagation(); // Prevent triggering parent click events
    
    if (loading) return;
    
    setLoading(true);
    
    try {
      const newStatus = await favoritesService.toggleFavorite(strategyId, isFavorited);
      setIsFavorited(newStatus);
      
      // Notify parent component
      if (onToggle) {
        onToggle(strategyId, newStatus);
      }
      
      // Show success message
      toast.success(
        newStatus ? 'Added to favorites!' : 'Removed from favorites!',
        {
          position: "top-right",
          autoClose: 2000,
        }
      );
      
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error(
        `Failed to ${isFavorited ? 'remove from' : 'add to'} favorites: ${error.message}`,
        {
          position: "top-right",
          autoClose: 4000,
        }
      );
    } finally {
      setLoading(false);
    }
  }, [strategyId, isFavorited, onToggle, loading]);

  return (
    <button
      className={`favorite-button ${size} ${isFavorited ? 'favorited' : ''} ${loading ? 'loading' : ''}`}
      onClick={handleToggle}
      disabled={loading}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorited ? (
        <FaBookmark className="favorite-icon" />
      ) : (
        <FaRegBookmark className="favorite-icon" />
      )}
    </button>
  );
};

export default FavoriteButton;
