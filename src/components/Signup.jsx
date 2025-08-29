import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { signup, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setTimeout(() => {
        navigate('/strategies');
      }, 2000);
    }
  }, [isAuthenticated, user, navigate]);

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

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Log the data before sending it
    console.log('Datos a enviar:', {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword
    });

    const result = await signup(
      formData.username, 
      formData.email, 
      formData.password,
      formData.confirmPassword
    );
    
    if (result.success) {
      setSuccess('Account created successfully! Redirecting to strategies...');
      setTimeout(() => {
        navigate(result.redirectTo || '/strategies');
      }, 1500);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  // If already authenticated, show redirect message
  if (isAuthenticated) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <h1>Already Signed In</h1>
            <p>You are already authenticated</p>
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
          <h1>Create Account</h1>
          <p>Join TradeLab and start backtesting strategies</p>
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
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
