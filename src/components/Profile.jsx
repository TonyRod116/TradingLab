import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getToken } from '../utils/auth';
import { FaChartLine, FaCog, FaPlus, FaEdit, FaTrash, FaPlay, FaPause } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { cleanStrategyName } from '../utils/strategyUtils';
import Header from './Header';
import ConfirmDialog from './ConfirmDialog';
import './Profile.css';

const Profile = () => {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    bio: 'No bio yet. Click edit to add one!',
    profile_picture: null,
    date_joined: '2024-01-01',
    strategies_count: 0
  });
  
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    strategyId: null,
    strategyName: ''
  });

  const isOwnProfile = useMemo(() => {
    return isAuthenticated && String(currentUser?.id) === String(user_id);
  }, [isAuthenticated, currentUser?.id, user_id]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/users/login/');
      return;
    }

    if (currentUser) {
      // Set basic context data first
      const userProfile = {
        username: currentUser.username || 'Trader',
        email: currentUser.email || 'user@example.com',
        bio: currentUser.bio || 'No bio yet. Click edit to add one!',
        profile_image: currentUser.profile_image || null,
        date_joined: currentUser.date_joined || '2024-01-01',
        strategies_count: currentUser.strategies_count || 0
      };
      setProfile(userProfile);
      
      // Try to load additional data from backend (optional)
      const loadProfileData = async () => {
        try {
          const token = getToken();
          if (!token) return;
          
          const response = await axios.get('http://localhost:8000/api/users/profile/', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.data) {
            setProfile(prev => ({
              ...prev,
              username: response.data.username || prev.username,
              bio: response.data.bio || prev.bio,
              profile_image: response.data.profile_image || prev.profile_image
            }));
          }
        } catch (error) {
          // Continue with context data only
        }
      };
      
      loadProfileData();
    }
  }, [currentUser, isAuthenticated, navigate]);

  const loadUserStrategies = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      
      const response = await fetch(`http://localhost:8000/api/strategies/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStrategies(data.results || data);
        setProfile(prev => ({
          ...prev,
          strategies_count: (data.results || data).length
        }));
      } else {
        console.error('Failed to load strategies:', response.status, response.statusText);
        setStrategies([]);
      }
    } catch (error) {
      console.error('Error loading strategies:', error);
      setStrategies([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user_id]);

  // Load user strategies when component mounts or user_id changes
  useEffect(() => {
    if (isAuthenticated && user_id) {
      loadUserStrategies();
    }
  }, [isAuthenticated, user_id, loadUserStrategies]);

  const handleEditProfile = useCallback(() => {
    navigate('/users/profile');
  }, [navigate]);

  const handleCreateStrategy = useCallback(() => {
    navigate('/strategies?tab=create-strategy');
  }, [navigate]);

  const handleEditStrategy = useCallback((strategyId) => {
    navigate(`/strategies/edit/${strategyId}`);
  }, [navigate]);

  const handleDeleteStrategy = useCallback((strategyId, strategyName) => {
    setConfirmDialog({
      isOpen: true,
      strategyId,
      strategyName
    });
  }, []);

  const confirmDeleteStrategy = useCallback(async () => {
    if (!confirmDialog.strategyId) return;
    
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/api/strategies/${confirmDialog.strategyId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast.success('Strategy deleted successfully');
        loadUserStrategies(); // Reload strategies
      } else {
        toast.error('Failed to delete strategy');
      }
    } catch (error) {
      console.error('Error deleting strategy:', error);
      toast.error('Error deleting strategy');
    } finally {
      setConfirmDialog({
        isOpen: false,
        strategyId: null,
        strategyName: ''
      });
    }
  }, [confirmDialog.strategyId, loadUserStrategies]);

  const cancelDeleteStrategy = useCallback(() => {
    setConfirmDialog({
      isOpen: false,
      strategyId: null,
      strategyName: ''
    });
  }, []);



  const renderProfileAvatar = () => {
    return (
      <div className="profile-avatar-section">
        <div className="profile-avatar">
          {profile.profile_image ? (
            <img 
              src={profile.profile_image} 
              alt={`${profile.username}'s profile`}
              className="avatar-image"
            />
          ) : (
            <div className="avatar-placeholder">
              <span className="avatar-initial">
                {profile.username?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProfileInfo = () => (
    <div className="profile-info">
      <div className="profile-name-section">
        <h1 className="profile-username">{profile.username}</h1>
        <button 
          className="btn btn-edit-profile"
          onClick={handleEditProfile}
        >
          <FaCog size={16} style={{ marginRight: '8px' }} />
          Edit Profile
        </button>
      </div>
      
      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-number">{profile.strategies_count}</span>
          <span className="stat-label">Strategies</span>
        </div>
      </div>

      <div className="profile-bio">
        <h3>About</h3>
        <p>{profile.bio}</p>
      </div>
    </div>
  );

  const renderEmptyStrategies = () => (
    <div className="empty-strategies">
      <FaChartLine size={48} color="#00ff88" />
      <p>
        {isOwnProfile 
          ? "Start building your first strategy to see it here!"
          : `${profile.username} hasn't created any strategies yet.`
        }
      </p>
      {isOwnProfile && (
        <button className="btn btn-primary">
          <FaPlus /> Create Your First Strategy
        </button>
      )}
    </div>
  );

  const renderStrategiesGrid = () => (
    <div className="strategies-grid">
      {strategies.map((strategy) => (
        <div key={strategy.id} className="strategy-card">
          <div className="strategy-header">
            <h3>{cleanStrategyName(strategy.name)}</h3>
            <div className="strategy-meta">
              <span className="symbol-timeframe">{strategy.symbol} • {strategy.timeframe}</span>
            </div>
          </div>
          <p>{strategy.description}</p>
          <div className="strategy-metrics">
            <div className="metric">
              <span className="metric-label">Win Rate:</span>
              <span className="metric-value">
                {(() => {
                  const winRate = strategy.win_rate;
                  console.log('Win Rate debug:', { winRate, type: typeof winRate, parsed: parseFloat(winRate) });
                  
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
            <div className="metric">
              <span className="metric-label">Total Trades:</span>
              <span className="metric-value">{strategy.total_trades || 'N/A'}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Profit Factor:</span>
              <span className="metric-value">{strategy.profit_factor !== null && strategy.profit_factor !== undefined ? parseFloat(strategy.profit_factor).toFixed(2) : '0.00'}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Total Return:</span>
              <span className="metric-value">{strategy.total_return_percent ? parseFloat(strategy.total_return_percent).toFixed(2) : 'N/A'}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Max Drawdown:</span>
              <span className="metric-value">{strategy.max_drawdown ? parseFloat(strategy.max_drawdown).toFixed(2) : 'N/A'}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Sharpe Ratio:</span>
              <span className="metric-value">{strategy.sharpe_ratio ? parseFloat(strategy.sharpe_ratio).toFixed(2) : 'N/A'}</span>
            </div>
          </div>
          {isOwnProfile && (
            <div className="strategy-actions">
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDeleteStrategy(strategy.id, cleanStrategyName(strategy.name))}
              >
                <FaTrash /> Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderStrategiesSection = () => (
    <div className="strategies-section">
      <div className="section-header">
        <h2>Trading Strategies</h2>
        {isOwnProfile && (
          <button className="btn btn-create-strategy" onClick={handleCreateStrategy}>
            Create Strategy
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-strategies">
          <p>Loading strategies...</p>
        </div>
      ) : strategies.length === 0 ? (
        renderEmptyStrategies()
      ) : (
        renderStrategiesGrid()
      )}
    </div>
  );

  if (!isAuthenticated) {
    return null;
  }

  // Show loading state if no profile data yet
  if (!profile.username) {
    return (
      <div className="profile-page">
        <Header />
        <div className="profile-container">
          <div className="loading-profile">
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Header />
      <div className="profile-container">
        <div className="profile-header">
          {renderProfileAvatar()}
          {renderProfileInfo()}
        </div>

        <div className="profile-content">
          {renderStrategiesSection()}
        </div>
      </div>
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={cancelDeleteStrategy}
        onConfirm={confirmDeleteStrategy}
        title="Delete Strategy"
        message={`Are you sure you want to delete "${confirmDialog.strategyName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Profile;
