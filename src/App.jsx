import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import './App.css';

const Hero = () => {
  const navigate = useNavigate();

  const handleStartFree = () => {
    navigate('/users/signup/');
  };

  return (
    <section className="hero">
      <div className="hero-container">
        <h1 className="hero-title">
          TradeLab
          <span className="hero-dot">.</span>
        </h1>
        <p className="hero-subtitle">
          Professional Strategy Backtesting Platform
        </p>
        <p className="hero-description">
          Transform your strategy ideas into executable strategies and run comprehensive backtests
        </p>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={handleStartFree}>
            Start Free
          </button>
        </div>
      </div>
    </section>
  );
};

const App = () => {
  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <Hero />
      </main>
    </div>
  );
};

export default App;
