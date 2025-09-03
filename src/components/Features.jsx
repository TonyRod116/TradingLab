import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaChartBar, 
  FaBolt, 
  FaChartLine, 
  FaCrosshairs, 
  FaLayerGroup, 
  FaDesktop
} from 'react-icons/fa';
import Header from './Header';
import './Features.css';

const Features = () => {
  return (
    <div className="features-page">
      <Header />
      <div className="features-container">
        <div className="features-hero">
          <h1>Powerful Strategy Backtesting</h1>
          <p>Test your strategies against historical data with professional-grade tools</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaChartBar size={48} color="#00ff88" />
            </div>
            <h3>Historical Data Analysis</h3>
            <p>Access comprehensive historical market data to backtest your strategies across multiple timeframes and market conditions.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaBolt size={48} color="#00ff88" />
            </div>
            <h3>Real-time Strategy Testing</h3>
            <p>Execute your strategy algorithms against historical data in real-time simulation to identify optimal entry and exit points.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaChartLine size={48} color="#00ff88" />
            </div>
            <h3>Performance Metrics</h3>
            <p>Get detailed performance analytics including Sharpe ratio, maximum drawdown, win rate, and risk-adjusted returns.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaCrosshairs size={48} color="#00ff88" />
            </div>
            <h3>Strategy Optimization</h3>
            <p>Fine-tune your strategy parameters with advanced optimization algorithms to maximize profitability and minimize risk.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaLayerGroup size={48} color="#00ff88" />
            </div>
            <h3>Portfolio Management</h3>
            <p>Test multiple strategies simultaneously and analyze portfolio-level performance with correlation analysis.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaDesktop size={48} color="#00ff88" />
            </div>
            <h3>User-Friendly Interface</h3>
            <p>Intuitive web-based platform accessible from anywhere, with responsive design for desktop and mobile devices.</p>
          </div>
        </div>

        <div className="features-cta">
          <h2>Ready to Transform Your Strategy Testing?</h2>
          <p>Join thousands of traders who use our platform to validate and optimize their strategies</p>
          <Link to="/strategies/" className="btn btn-primary">Get Started Free</Link>
        </div>
      </div>
    </div>
  );
};

export default Features;
