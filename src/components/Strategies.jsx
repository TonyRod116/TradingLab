import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FaChartLine, 
  FaPlus, 
  FaRocket, 
  FaCog, 
  FaLightbulb,
  FaDatabase,
  FaTachometerAlt,
  FaShieldAlt,
  FaCopy,
  FaBookmark
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl, API_ENDPOINTS } from '../config/api.js';
import Header from './Header';
import StrategyList from './StrategyList';
import FavoritesList from './FavoritesList';
import StrategyCreator from './StrategyCreator';
import StrategyTemplates from './StrategyTemplates';
import RuleBuilder from './RuleBuilder';
import './Strategies.css';

const Strategies = () => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('my-strategies');
  const [strategies, setStrategies] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const loadStrategies = useCallback(async () => {
    setLoading(true);
    try {
      // Use community endpoint that doesn't require authentication
      const response = await fetch(`${getApiUrl(API_ENDPOINTS.STRATEGIES)}community/`);
      
      if (response.ok) {
        const data = await response.json();
        setStrategies(data.results || data);
      } else {
        toast.error('Failed to load community strategies', {
          position: "top-right",
          autoClose: 4000,
          toastId: 'load-strategies-error' // Prevent duplicate toasts
        });
      }
    } catch (err) {
      toast.error('Network error loading community strategies', {
        position: "top-right",
        autoClose: 4000,
        toastId: 'load-strategies-network-error' // Prevent duplicate toasts
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStrategies();
  }, [loadStrategies]);

  // Handle URL tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['my-strategies', 'templates', 'create-strategy'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleTemplateSelect = useCallback((template) => {
    // Navigate to strategy creator with the selected template
    setSelectedTemplate(template);
    setActiveTab('create-strategy');
  }, []);

  const renderAuthenticatedView = () => (
    <div className="strategies-container">
              <div className="strategies-header">
          <h1>Strategy Management</h1>
          <p>Create, manage, and backtest your trading strategies</p>
        </div>

      <div className="strategies-tabs">
        <button 
          className={`tab-button ${activeTab === 'my-strategies' ? 'active' : ''}`}
          onClick={() => handleTabChange('my-strategies')}
        >
          Community Backtests
        </button>
        <button 
          className={`tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => handleTabChange('favorites')}
        >
          <FaBookmark /> My Favorites
        </button>
        <button 
          className={`tab-button ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => handleTabChange('templates')}
        >
          <FaCopy /> Strategy Templates
        </button>
        <button 
          className={`tab-button ${activeTab === 'create-strategy' ? 'active' : ''}`}
          onClick={() => handleTabChange('create-strategy')}
        >
          Create Strategy
        </button>
      </div>

      <div className="strategies-content">
        {activeTab === 'my-strategies' && (
          <StrategyList 
            strategies={strategies} 
            loading={loading}
          />
        )}
        
        {activeTab === 'favorites' && (
          <FavoritesList />
        )}
        
        {activeTab === 'templates' && (
          <StrategyTemplates 
            onTemplateSelect={handleTemplateSelect}
            onCreateStrategy={() => handleTabChange('create-strategy')}
          />
        )}
        
        {activeTab === 'create-strategy' && (
          <StrategyCreator 
            onBack={() => {
              setSelectedTemplate(null);
              handleTabChange('my-strategies');
            }}
            template={selectedTemplate}
          />
        )}
      </div>
    </div>
  );

  const renderUnauthenticatedView = () => (
    <div className="strategies-container">
      <div className="strategies-header">
        <h1>Strategy Backtesting Platform</h1>
        <p>Create and test your trading strategies with our advanced rule builder</p>
      </div>

      <div className="auth-prompt">
        <h2>Join the Community</h2>
        <p>Sign up or sign in to start creating and backtesting your strategies</p>
        <div className="auth-buttons">
          <a href="/users/signup/" className="btn btn-primary">Sign Up</a>
          <a href="/users/login/" className="btn btn-secondary">Sign In</a>
        </div>
      </div>

      {/* Show community strategies for unauthenticated users */}
      <div className="community-section">
        <h2>Community Strategies</h2>
        <p>Explore strategies created by our community</p>
        <StrategyList 
          strategies={strategies} 
          loading={loading}
          showUserInfo={true}
        />
      </div>

      <div className="features-preview">
        <div className="feature-card">
          <h3>Strategy Templates</h3>
          <p>Start with proven strategies like RSI Mean Reversion, Moving Average Crossover, and more</p>
        </div>
        <div className="feature-card">
          <h3>Rule Builder</h3>
          <p>Create complex strategies using technical indicators, price action, and volume</p>
        </div>
        <div className="feature-card">
          <h3>Backtesting</h3>
          <p>Test your strategies against historical data to validate performance</p>
        </div>
        <div className="feature-card">
          <h3>Performance Analytics</h3>
          <p>Get detailed insights into your strategy's performance metrics</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="strategies-page">
      <Header />
      {isAuthenticated ? renderAuthenticatedView() : renderUnauthenticatedView()}
    </div>
  );
};

export default Strategies;
