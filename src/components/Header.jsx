import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
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
    toast.success('Logged out successfully', {
      position: "top-right",
      autoClose: 2000,
    });
    navigate('/strategies');
  };

  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/strategies');
    } else {
      navigate('/');
    }
  };

  // Function to determine if a link should be active
  const isLinkActive = (path) => {
    if (path === '/') {
      // For home page, highlight Strategies if user is authenticated
      return location.pathname === '/' && isAuthenticated;
    }
    if (path === '/profile') {
      // For profile, check if we're on any profile-related page
      return location.pathname.includes('/users/profile');
    }
    return location.pathname === path;
  };

  // Function to get active class for navigation links
  const getActiveClass = (path) => {
    if (path === '/') {
      // Special case: if we're on home page and user is authenticated, highlight Strategies
      if (location.pathname === '/' && isAuthenticated) {
        return 'nav-link active';
      }
      return 'nav-link';
    }
    return isLinkActive(path) ? 'nav-link active' : 'nav-link';
  };

  // Function to get active class for profile button
  const getProfileActiveClass = () => {
    return location.pathname.includes('/users/profile') ? 'btn btn-profile active' : 'btn btn-profile';
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
          <Link to="/features" className={getActiveClass('/features')}>
            Features
          </Link>
          <Link to="/about" className={getActiveClass('/about')}>
            About
          </Link>
          <Link to="/pricing" className={getActiveClass('/pricing')}>
            Pricing
          </Link>
          {isAuthenticated && (
            <Link to="/strategies" className={getActiveClass('/strategies')}>
              Strategies
            </Link>
          )}
        </nav>

        {/* Auth Buttons */}
        <div className="auth-buttons">
          {isAuthenticated ? (
            <>
              <button 
                className={getProfileActiveClass()}
                onClick={() => navigate(`/users/profile/${user?.id}`)}
              >
                Profile
              </button>
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
            <Link to="/features" className={getActiveClass('/features')}>
              Features
            </Link>
            <Link to="/about" className={getActiveClass('/about')}>
              About
            </Link>
            <Link to="/pricing" className={getActiveClass('/pricing')}>
              Pricing
            </Link>
            {isAuthenticated && (
              <Link to="/strategies" className={getActiveClass('/strategies')}>
                Strategies
              </Link>
            )}
          </nav>
          <div className="auth-buttons-mobile">
            {isAuthenticated ? (
              <>
                <button 
                  className={getProfileActiveClass()} 
                  onClick={() => navigate(`/users/profile/${user?.id}`)}
                >
                  Profile
                </button>
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
