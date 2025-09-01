import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaChartLine, 
  FaPlus, 
  FaRocket, 
  FaCog, 
  FaLightbulb,
  FaDatabase,
  FaTachometerAlt,
  FaShieldAlt
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import StrategyList from './StrategyList';
import StrategyCreator from './StrategyCreator';
import RuleBuilder from './RuleBuilder';
import './Strategies.css';

const Strategies = () => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('my-strategies');
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadStrategies = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/strategies/strategies/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStrategies(data);
      } else {
        setError('Failed to load strategies');
      }
    } catch (err) {
      setError('Network error loading strategies');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadStrategies();
  }, [loadStrategies]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderAuthenticatedView = () => (
    <div className="strategies-container">
              <div className="strategies-header">
          <h1><FaRocket className="header-icon" /> Strategy Management</h1>
          <p>Create, manage, and backtest your trading strategies using pre-calculated indicators</p>
          <div className="backend-highlight">
            <span className="highlight-badge"><FaDatabase className="badge-icon" /> Parquet Backend</span>
            <span className="highlight-badge"><FaLightbulb className="badge-icon" /> 25+ Pre-calculated Indicators</span>
            <span className="highlight-badge"><FaTachometerAlt className="badge-icon" /> Optimized for Fast Backtesting</span>
          </div>
        </div>

      <div className="strategies-tabs">
        <button 
          className={`tab-button ${activeTab === 'my-strategies' ? 'active' : ''}`}
          onClick={() => handleTabChange('my-strategies')}
        >
          My Strategies
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
            error={error}
            onRefresh={loadStrategies}
          />
        )}
        
        {activeTab === 'create-strategy' && (
          <StrategyCreator 
            onStrategyCreated={loadStrategies}
            onBack={() => handleTabChange('my-strategies')}
          />
        )}
        

      </div>
    </div>
  );

  const renderUnauthenticatedView = () => (
    <div className="strategies-container">
      <div className="strategies-header">
        <h1><FaRocket className="header-icon" /> Strategy Backtesting Platform</h1>
        <p>Create and test your trading strategies with our advanced rule builder powered by pre-calculated indicators</p>
        <div className="backend-highlight">
          <span className="highlight-badge"><FaDatabase className="badge-icon" /> Parquet Backend</span>
          <span className="highlight-badge"><FaLightbulb className="badge-icon" /> 25+ Pre-calculated Indicators</span>
          <span className="highlight-badge"><FaTachometerAlt className="badge-icon" /> Optimized for Fast Backtesting</span>
        </div>
      </div>

      <div className="auth-prompt">
        <h2>Join the Community</h2>
        <p>Sign up or sign in to start creating and backtesting your strategies</p>
        <div className="auth-buttons">
          <a href="/users/signup/" className="btn btn-primary">Sign Up</a>
          <a href="/users/login/" className="btn btn-secondary">Sign In</a>
        </div>
      </div>

      <div className="features-preview">
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
