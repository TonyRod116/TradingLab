import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  const [isEditing, setIsEditing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [strategies, setStrategies] = useState([]);

  useEffect(() => {
    // Use authenticated user data or fetch from API
    if (currentUser) {
      const userProfile = {
        username: currentUser.username || 'User',
        email: currentUser.email || 'user@example.com',
        bio: currentUser.bio || 'No bio yet. Click edit to add one!',
        profile_picture: currentUser.profile_picture || null,
        date_joined: currentUser.date_joined || '2024-01-01',
        strategies_count: currentUser.strategies_count || 0
      };
      setProfile(userProfile);
      
      // Check if this is the user's own profile
      // For now, always show as own profile if authenticated
      setIsOwnProfile(true);
    } else {
      // TODO: Fetch profile data from API for other users
      // For now, redirect to login if not authenticated
      navigate('/users/login/');
    }
  }, [user_id, currentUser, navigate]);

  const handleEditProfile = () => {
    navigate('/users/profile/edit');
  };



  return (
    <div className="profile-page">
      <Header />
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {profile.profile_picture ? (
                <img 
                  src={profile.profile_picture} 
                  alt={`${profile.username}'s profile`}
                  className="avatar-image"
                />
              ) : (
                <div className="avatar-placeholder">
                  <span className="avatar-initial">{profile.username.charAt(0).toUpperCase()}</span>
                </div>
              )}

            </div>
          </div>

          <div className="profile-info">
            <div className="profile-name-section">
              <h1 className="profile-username">{profile.username}</h1>
              {isOwnProfile && (
                <button 
                  className="btn btn-edit-profile"
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </button>
              )}
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
        </div>

        <div className="profile-content">
          <div className="strategies-section">
            <div className="section-header">
              <h2>Trading Strategies</h2>
              {isOwnProfile && (
                <button className="btn btn-create-strategy">
                  Create Strategy
                </button>
              )}
            </div>

            {strategies.length === 0 ? (
              <div className="empty-strategies">
                <div className="empty-icon">📊</div>
                <h3>No strategies yet</h3>
                <p>
                  {isOwnProfile 
                    ? "Start building your first trading strategy to see it here!"
                    : `${profile.username} hasn't created any strategies yet.`
                  }
                </p>
                {isOwnProfile && (
                  <button className="btn btn-primary">
                    Create Your First Strategy
                  </button>
                )}
              </div>
            ) : (
              <div className="strategies-grid">
                {strategies.map(strategy => (
                  <div key={strategy.id} className="strategy-card">
                    <h3>{strategy.name}</h3>
                    <p>{strategy.description}</p>
                    <div className="strategy-stats">
                      <span className="stat">Win Rate: {strategy.win_rate}%</span>
                      <span className="stat">Total Trades: {strategy.total_trades}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
