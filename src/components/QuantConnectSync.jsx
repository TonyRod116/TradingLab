import React, { useState, useEffect } from 'react';
import { FaSync, FaCheck, FaExclamationTriangle, FaChartLine, FaCog } from 'react-icons/fa';
import axios from 'axios';
import './QuantConnectSync.css';

const QuantConnectSync = ({ onStrategiesLoaded, isConnected, onConnectionChange }) => {
  const [formData, setFormData] = useState({
    quantconnect_user_id: '',
    quantconnect_api_token: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [autoSync, setAutoSync] = useState(true);

  // Load saved credentials from localStorage
  useEffect(() => {
    const savedUserId = localStorage.getItem('quantconnect_user_id');
    const savedApiToken = localStorage.getItem('quantconnect_api_token');
    
    if (savedUserId && savedApiToken) {
      setFormData({
        quantconnect_user_id: savedUserId,
        quantconnect_api_token: savedApiToken
      });
      
      // Auto-connect if credentials are saved
      if (autoSync && !isConnected) {
        handleAutoConnect();
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAutoConnect = async () => {
    if (!formData.quantconnect_user_id || !formData.quantconnect_api_token) {
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        'http://localhost:8000/strategies/sync-quantconnect/',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setResult(response.data);
      
      // Save credentials to localStorage
      localStorage.setItem('quantconnect_user_id', formData.quantconnect_user_id);
      localStorage.setItem('quantconnect_api_token', formData.quantconnect_api_token);
      
      // Notify parent component
      onConnectionChange(true);
      if (onStrategiesLoaded) {
        onStrategiesLoaded(response.data);
      }
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to QuantConnect');
      onConnectionChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleAutoConnect();
  };

  const handleDisconnect = () => {
    localStorage.removeItem('quantconnect_user_id');
    localStorage.removeItem('quantconnect_api_token');
    setFormData({ quantconnect_user_id: '', quantconnect_api_token: '' });
    setResult(null);
    onConnectionChange(false);
  };

  const handleRefresh = async () => {
    if (isConnected) {
      await handleAutoConnect();
    }
  };

  if (isConnected && result) {
    return (
      <div className="quantconnect-sync connected">
        <div className="sync-header">
          <h3><FaCheck /> Connected to QuantConnect</h3>
          <p>Your strategies are automatically synced and up to date</p>
        </div>
        
        <div className="connection-status">
          <div className="status-item">
            <span className="label">User ID:</span>
            <span className="value">{formData.quantconnect_user_id}</span>
          </div>
          <div className="status-item">
            <span className="label">Last Sync:</span>
            <span className="value">{new Date().toLocaleString()}</span>
          </div>
          <div className="status-item">
            <span className="label">Strategies:</span>
            <span className="value">{result.synced_count} synced</span>
          </div>
        </div>

        <div className="connection-actions">
          <button 
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSync className="spinning" />
                Refreshing...
              </>
            ) : (
              <>
                <FaSync />
                Refresh Data
              </>
            )}
          </button>
          <button 
            className="btn btn-danger"
            onClick={handleDisconnect}
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quantconnect-sync">
      <div className="sync-header">
        <h3><FaChartLine /> Connect to QuantConnect</h3>
        <p>Enter your credentials to automatically sync your trading strategies</p>
      </div>

      <form onSubmit={handleSubmit} className="sync-form">
        <div className="form-group">
          <label htmlFor="quantconnect_user_id">QuantConnect User ID</label>
          <input
            type="text"
            id="quantconnect_user_id"
            name="quantconnect_user_id"
            value={formData.quantconnect_user_id}
            onChange={handleChange}
            placeholder="Enter your QuantConnect User ID"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="quantconnect_api_token">API Token</label>
          <input
            type="password"
            id="quantconnect_api_token"
            name="quantconnect_api_token"
            value={formData.quantconnect_api_token}
            onChange={handleChange}
            placeholder="Enter your QuantConnect API Token"
            required
          />
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
            />
            <span className="checkmark"></span>
            Automatically sync strategies when connected
          </label>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary sync-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <FaSync className="spinning" />
              Connecting...
            </>
          ) : (
            <>
              <FaCog />
              Connect & Sync
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="sync-error">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {result && !isConnected && (
        <div className="sync-success">
          <FaCheck />
          <span>{result.message}</span>
          <p>Successfully synced {result.synced_count} strategies!</p>
        </div>
      )}
    </div>
  );
};

export default QuantConnectSync;
