import React, { useState } from 'react';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo">
          <span className="logo-text">TradeLab</span>
          <span className="logo-dot">.</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          <a href="#features" className="nav-link">Features</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#pricing" className="nav-link">Pricing</a>
        </nav>

        {/* Auth Buttons */}
        <div className="auth-buttons">
          <button className="btn btn-login">Login</button>
          <button className="btn btn-signup">Sign Up</button>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="menu-toggle" onClick={toggleMenu}>
          <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
          <nav className="nav-mobile">
            <a href="#features" className="nav-link">Features</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#pricing" className="nav-link">Pricing</a>
          </nav>
          <div className="auth-buttons-mobile">
            <button className="btn btn-login">Login</button>
            <button className="btn btn-signup">Sign Up</button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
