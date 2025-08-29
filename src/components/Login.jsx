import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setTimeout(() => {
        navigate('/strategies');
      }, 2000);
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await login(formData.identifier, formData.password);
    
    if (result.success) {
      setSuccess('Redirecting to strategies...');
      setTimeout(() => {
        navigate(result.redirectTo || '/strategies');
      }, 1500);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  // If already authenticated, show welcome message
  if (isAuthenticated) {
    return (
      <div className="auth-page">
        <Header />
        <div className="auth-container">
          <div className="auth-header">
            <h1>Welcome back, {user?.username || 'Trader'}!</h1>
          </div>
          
          {success && (
            <div className="auth-success">
              {success}
            </div>
          )}
          
          <div className="auth-footer">
            <p>Redirecting to strategies page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <Header />
      <div className="auth-container">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your TradeLab account</p>
        </div>
        
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}
        
        {success && (
          <div className="auth-success">
            {success}
          </div>
        )}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identifier">Username</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
