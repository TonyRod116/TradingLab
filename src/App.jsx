import React from 'react';
import Header from './components/Header';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-container">
            <h1 className="hero-title">
              TradeLab
              <span className="hero-dot">.</span>
            </h1>
            <p className="hero-subtitle">
              AI-Powered Trading Strategy Backtesting
            </p>
            <p className="hero-description">
              Convert your Trade ideas into executable strategies and run backtests 
              with real historical data. Analyze performance metrics and optimize 
              your strategies to maximize profits.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary">Start Free</button>
              <button className="btn btn-secondary">View Demo</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
