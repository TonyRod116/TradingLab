import React from 'react';
import Header from './components/Header';
import './App.css';

const Hero = () => (
  <section className="hero">
    <div className="hero-container">
      <h1 className="hero-title">
        TradeLab
        <span className="hero-dot">.</span>
      </h1>
      <p className="hero-subtitle">
        Professional Trading Strategy Backtesting Platform
      </p>
      <p className="hero-description">
        Transform your trading ideas into executable strategies and run comprehensive backtests 
        with real historical data. Analyze performance metrics, optimize parameters, and 
        validate your strategies before risking real capital.
      </p>
      <div className="hero-buttons">
        <button className="btn btn-primary">Start Free</button>
        <button className="btn btn-secondary">View Demo</button>
      </div>
    </div>
  </section>
);

const App = () => (
  <div className="App">
    <Header />
    <main className="main-content">
      <Hero />
    </main>
  </div>
);

export default App;
