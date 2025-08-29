import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import './Strategies.css';

const Strategies = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="strategies-page">
      <Header />
      <div className="strategies-container">
        <div className="strategies-header">
          <h1>Trading Strategies</h1>
          <p>Discover and analyze trading strategies from the community</p>
        </div>

        {isAuthenticated ? (
          <div className="user-welcome-section">
            <h2>Welcome back, {user?.username || 'Trader'}!</h2>
            <p>Ready to explore strategies or create your own?</p>
            <div className="action-buttons">
              <button className="btn btn-primary">Create Strategy</button>
              <button className="btn btn-secondary">My Strategies</button>
            </div>
          </div>
        ) : (
          <div className="auth-prompt">
            <h2>Join the Community</h2>
            <p>Sign up or sign in to create and explore trading strategies</p>
          </div>
        )}

        <div className="strategies-content">
          <div className="strategies-filters">
            <h3>Filters</h3>
            <div className="filter-group">
              <label>Performance</label>
              <select defaultValue="">
                <option value="">All</option>
                <option value="high">High Performance</option>
                <option value="medium">Medium Performance</option>
                <option value="low">Low Performance</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Category</label>
              <select defaultValue="">
                <option value="">All</option>
                <option value="trend">Trend Following</option>
                <option value="mean-reversion">Mean Reversion</option>
                <option value="breakout">Breakout</option>
                <option value="scalping">Scalping</option>
              </select>
            </div>
          </div>

          <div className="strategies-list">
            <h3>All Strategies</h3>
            <div className="no-strategies">
              <div className="empty-state">
                <h4>No strategies yet</h4>
                <p>Be the first to create a trading strategy!</p>
                {isAuthenticated && (
                  <button className="btn btn-primary">Create Your First Strategy</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Strategies;
