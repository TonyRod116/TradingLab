/**
 * Service for managing user favorites
 * Handles adding, removing, and fetching favorite strategies
 */

import { API_BASE_URL } from '../config/api.js';

class FavoritesService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get authentication token from localStorage
   * @returns {string|null} The authentication token
   */
  getToken() {
    return localStorage.getItem('access_token');
  }

  /**
   * Get favorites from localStorage
   * @returns {Array<number>} Array of strategy IDs
   */
  getLocalFavorites() {
    try {
      const favorites = localStorage.getItem('user_favorites');
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {

      return [];
    }
  }

  /**
   * Add a strategy to user's favorites
   * @param {number} strategyId - Strategy ID to add to favorites
   * @returns {Promise<Object>} Response data
   */
  async addToFavorites(strategyId) {
    try {
      const response = await fetch(`${this.baseURL}/api/strategies/${strategyId}/add-favorite/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Also update localStorage for offline support
      const favorites = this.getLocalFavorites();
      if (!favorites.includes(strategyId)) {
        favorites.push(strategyId);
        localStorage.setItem('user_favorites', JSON.stringify(favorites));
      }
      
      return data;
    } catch (error) {
      // Fallback to localStorage if backend fails
      try {
        const favorites = this.getLocalFavorites();
        if (!favorites.includes(strategyId)) {
          favorites.push(strategyId);
          localStorage.setItem('user_favorites', JSON.stringify(favorites));
        }
        return { success: true, strategy_id: strategyId };
      } catch (fallbackError) {
        throw new Error('Failed to add to favorites: ' + error.message);
      }
    }
  }

  /**
   * Remove a strategy from user's favorites
   * @param {number} strategyId - Strategy ID to remove from favorites
   * @returns {Promise<Object>} Response data
   */
  async removeFromFavorites(strategyId) {
    try {
      const response = await fetch(`${this.baseURL}/api/strategies/${strategyId}/remove-favorite/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Also update localStorage for offline support
      const favorites = this.getLocalFavorites();
      const updatedFavorites = favorites.filter(id => id !== strategyId);
      localStorage.setItem('user_favorites', JSON.stringify(updatedFavorites));
      
      return data;
    } catch (error) {
      // Fallback to localStorage if backend fails
      try {
        const favorites = this.getLocalFavorites();
        const updatedFavorites = favorites.filter(id => id !== strategyId);
        localStorage.setItem('user_favorites', JSON.stringify(updatedFavorites));
        return { success: true };
      } catch (fallbackError) {
        throw new Error('Failed to remove from favorites: ' + error.message);
      }
    }
  }

  /**
   * Get all user's favorite strategies
   * @returns {Promise<Array>} Array of favorite strategies
   */
  async getFavorites() {
    try {
      const response = await fetch(`${this.baseURL}/api/strategies/favorites/`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.results || [];
      } else {
        throw new Error(data.error || 'Failed to load favorites');
      }
    } catch (error) {
      // Fallback to localStorage if backend fails
      try {
        const favoriteIds = this.getLocalFavorites();
        
        if (favoriteIds.length === 0) {
          return [];
        }
        
        // Get strategy details for each favorite ID
        const strategies = [];
        for (const strategyId of favoriteIds) {
          try {
            const response = await fetch(`${this.baseURL}/api/strategies/${strategyId}/`, {
              headers: {
                'Authorization': `Bearer ${this.getToken()}`
              }
            });
            
            if (response.ok) {
              const strategy = await response.json();
              strategies.push({
                id: strategyId,
                strategy_id: strategyId,
                strategy: strategy,
                created_at: new Date().toISOString(),
                favorited_at: new Date().toISOString()
              });
            } else if (response.status === 404) {
              // Strategy no longer exists, remove from favorites
              await this.removeFromFavorites(strategyId);
            }
          } catch (error) {
            console.error(`Error loading strategy ${strategyId}:`, error);
          }
        }
        
        return strategies;
      } catch (fallbackError) {
        throw new Error('Failed to load favorites: ' + error.message);
      }
    }
  }

  /**
   * Check if a strategy is in user's favorites
   * @param {number} strategyId - Strategy ID to check
   * @returns {Promise<boolean>} True if strategy is favorited
   */
  async isFavorited(strategyId) {
    try {
      const response = await fetch(`${this.baseURL}/api/strategies/${strategyId}/check-favorite/`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success ? data.is_favorited : false;
    } catch (error) {
      // Fallback to localStorage if backend fails
      try {
        const favorites = this.getLocalFavorites();
        return favorites.includes(strategyId);
      } catch (fallbackError) {
        console.error('Error checking favorite status:', error);
        return false;
      }
    }
  }

  /**
   * Toggle favorite status of a strategy
   * @param {number} strategyId - Strategy ID to toggle
   * @param {boolean} currentStatus - Current favorite status
   * @returns {Promise<boolean>} New favorite status
   */
  async toggleFavorite(strategyId, currentStatus) {
    try {
      const response = await fetch(`${this.baseURL}/api/strategies/${strategyId}/toggle-favorite/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Also update localStorage for offline support
        const favorites = this.getLocalFavorites();
        if (data.is_favorited) {
          if (!favorites.includes(strategyId)) {
            favorites.push(strategyId);
            localStorage.setItem('user_favorites', JSON.stringify(favorites));
          }
        } else {
          const updatedFavorites = favorites.filter(id => id !== strategyId);
          localStorage.setItem('user_favorites', JSON.stringify(updatedFavorites));
        }
        
        return data.is_favorited;
      } else {
        throw new Error(data.error || 'Failed to toggle favorite');
      }
    } catch (error) {
      // Fallback to individual add/remove if backend fails
      try {
        if (currentStatus) {
          await this.removeFromFavorites(strategyId);
          return false;
        } else {
          await this.addToFavorites(strategyId);
          return true;
        }
      } catch (fallbackError) {
        throw error;
      }
    }
  }
}

export default new FavoritesService();
