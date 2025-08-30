import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getToken } from '../utils/auth';
import { FaChartLine, FaCog, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import Header from './Header';
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

  const isOwnProfile = useMemo(() => {
    return isAuthenticated && currentUser?.id === parseInt(user_id);
  }, [isAuthenticated, currentUser?.id, user_id]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/users/login/');
      return;
    }

    // Cargar datos del perfil desde el backend
    const loadProfileData = async () => {
      try {
        const token = getToken();
        if (!token) {
          return;
        }
        
        const response = await axios.get('http://localhost:8000/users/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data) {
          setProfile(prev => ({
            ...prev,
            username: response.data.username || prev.username,
            bio: response.data.bio || 'No bio yet. Click edit to add one!',
            profile_image: response.data.profile_image || null
          }));
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
        // Si falla, usar solo los datos del contexto
      }
    };

    if (currentUser) {
      // Establecer datos básicos del contexto
      const userProfile = {
        username: profile.username || currentUser.username || 'Trader',
        email: currentUser.email || 'user@example.com',
        bio: currentUser.bio || 'No bio yet. Click edit to add one!',
        profile_image: currentUser.profile_image || null,
        date_joined: currentUser.date_joined || '2024-01-01',
        strategies_count: currentUser.strategies_count || 0
      };
      setProfile(userProfile);
      
      // Cargar datos actualizados del backend
      loadProfileData();
    }
  }, [currentUser, isAuthenticated, navigate]);

  const handleEditProfile = useCallback(() => {
    navigate('/users/profile');
  }, [navigate]);

  const handleCreateStrategy = useCallback(() => {
    navigate('/strategies');
  }, [navigate]);

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
          <h3>{strategy.name}</h3>
          <p>{strategy.description}</p>
          <div className="strategy-metrics">
            <div className="metric">
              <span className="metric-label">Sharpe Ratio:</span>
              <span className="metric-value">{strategy.sharpe_ratio || 'N/A'}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Max Drawdown:</span>
              <span className="metric-value">{strategy.max_drawdown || 'N/A'}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Total Return:</span>
              <span className="metric-value">{strategy.total_return || 'N/A'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderStrategiesSection = () => (
    <div className="strategies-section">
      <div className="section-header">
        <h2>Trading Strategies</h2>
        <button className="btn btn-create-strategy" onClick={handleCreateStrategy}>
          Create Strategy
        </button>
      </div>

      {strategies.length === 0 ? renderEmptyStrategies() : renderStrategiesGrid()}
    </div>
  );

  if (!isAuthenticated) {
    return null;
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
    </div>
  );
};

export default Profile;
