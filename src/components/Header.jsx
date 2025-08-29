import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogin = () => {
    navigate('/users/login/');
  };

  const handleSignup = () => {
    navigate('/users/signup/');
  };

  const handleLogout = () => {
    logout();
    navigate('/strategies');
  };

  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/strategies');
    } else {
      navigate('/');
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo" onClick={handleLogoClick}>
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
                      {isAuthenticated ? (
              <>
                <span className="user-welcome">
                  Welcome, {user?.username || 'Trader'}
                  {console.log('🔍 Header Debug - User object:', user)}
                  {console.log('🔍 Header Debug - Username:', user?.username)}
                  {console.log('🔍 Header Debug - isAuthenticated:', isAuthenticated)}
                </span>
                <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
              </>
          ) : (
            <>
              <button className="btn btn-login" onClick={handleLogin}>Login</button>
              <button className="btn btn-signup" onClick={handleSignup}>Sign Up</button>
            </>
          )}
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
            {isAuthenticated ? (
              <>
                <span className="user-welcome">
                  Welcome, {user?.username || 'User'}
                </span>
                <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <button className="btn btn-login" onClick={handleLogin}>Login</button>
                <button className="btn btn-signup" onClick={handleSignup}>Sign Up</button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
