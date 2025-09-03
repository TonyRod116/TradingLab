/**
 * Service for managing user favorites
 * Handles adding, removing, and fetching favorite strategies
 */
class FavoritesService {
  constructor() {
    this.baseURL = 'http://localhost:8000';
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
      console.warn('Error parsing favorites from localStorage:', error);
      return [];
    }
  }

  /**
   * Add a strategy to user's favorites
   * @param {number} strategyId - Strategy ID to add to favorites
   * @returns {Promise<Object>} Response data
   */
  async addToFavorites(strategyId) {
    // For now, use localStorage until backend endpoints are implemented
    try {
      const favorites = this.getLocalFavorites();
      if (!favorites.includes(strategyId)) {
        favorites.push(strategyId);
        localStorage.setItem('user_favorites', JSON.stringify(favorites));
      }
      return { success: true, strategy_id: strategyId };
    } catch (error) {
      throw new Error('Failed to add to favorites: ' + error.message);
    }
  }

  /**
   * Remove a strategy from user's favorites
   * @param {number} strategyId - Strategy ID to remove from favorites
   * @returns {Promise<Object>} Response data
   */
  async removeFromFavorites(strategyId) {
    // For now, use localStorage until backend endpoints are implemented
    try {
      const favorites = this.getLocalFavorites();
      const updatedFavorites = favorites.filter(id => id !== strategyId);
      localStorage.setItem('user_favorites', JSON.stringify(updatedFavorites));
      return { success: true };
    } catch (error) {
      throw new Error('Failed to remove from favorites: ' + error.message);
    }
  }

  /**
   * Get all user's favorite strategies
   * @returns {Promise<Array>} Array of favorite strategies
   */
  async getFavorites() {
    // For now, use localStorage until backend endpoints are implemented
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
            console.warn(`Strategy ${strategyId} no longer exists, removing from favorites`);
            await this.removeFromFavorites(strategyId);
          }
        } catch (error) {
          console.warn(`Could not load strategy ${strategyId}:`, error);
        }
      }
      
      return strategies;
    } catch (error) {
      throw new Error('Failed to load favorites: ' + error.message);
    }
  }

  /**
   * Check if a strategy is in user's favorites
   * @param {number} strategyId - Strategy ID to check
   * @returns {Promise<boolean>} True if strategy is favorited
   */
  async isFavorited(strategyId) {
    try {
      const favorites = this.getLocalFavorites();
      return favorites.includes(strategyId);
    } catch (error) {
      console.warn('Could not check if strategy is favorited:', error);
      return false;
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
      if (currentStatus) {
        await this.removeFromFavorites(strategyId);
        return false;
      } else {
        await this.addToFavorites(strategyId);
        return true;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }
}

export default new FavoritesService();
