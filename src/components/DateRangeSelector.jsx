import React, { useState, useEffect, useCallback } from 'react';
import { FaCalendar, FaExclamationTriangle, FaClock } from 'react-icons/fa';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import './DateRangeSelector.css';

const DateRangeSelector = ({ timeframe, onDateRangeChange, onEstimationChange }) => {
  const [selectedPreset, setSelectedPreset] = useState('3months');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [availableRange, setAvailableRange] = useState(null);
  const [estimation, setEstimation] = useState(null);
  const [loading, setLoading] = useState(true);

  const datePresets = [
    { id: '3months', label: 'Last 3 Months', months: 3 },
    { id: '6months', label: 'Last 6 Months', months: 6 },
    { id: '1year', label: 'Last Year', months: 12 },
    { id: 'all', label: 'All Available Data', all: true },
    { id: 'custom', label: 'Custom Range', custom: true }
  ];

  // Fetch available date range from backend
  useEffect(() => {
    const fetchAvailableRange = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          getApiUrl(`/api/strategies/available_date_range/?symbol=ES&timeframe=${timeframe}`)
        );
        setAvailableRange({
          minDate: new Date(response.data.min_date),
          maxDate: new Date(response.data.max_date)
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching available date range:', error);
        setLoading(false);
      }
    };

    fetchAvailableRange();
  }, [timeframe]);

  // Calculate dates based on preset
  const calculateDates = useCallback((preset, customStart = null, customEnd = null) => {
    if (!availableRange) return null;

    let startDate, endDate;

    if (preset === 'custom' && customStart && customEnd) {
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
    } else if (preset === 'all') {
      startDate = new Date(availableRange.minDate);
      endDate = new Date(availableRange.maxDate);
    } else {
      const presetConfig = datePresets.find(p => p.id === preset);
      if (presetConfig && presetConfig.months) {
        endDate = new Date(availableRange.maxDate);
        startDate = new Date(endDate);
        startDate.setMonth(startDate.getMonth() - presetConfig.months);
        
        // Ensure start date is not before available data
        if (startDate < availableRange.minDate) {
          startDate = new Date(availableRange.minDate);
        }
      }
    }

    return { startDate, endDate };
  }, [availableRange, datePresets]);

  // Estimate data size
  const estimateDataSize = useCallback((startDate, endDate) => {
    if (!startDate || !endDate) return null;

    const timeframeMinutes = {
      '1m': 1, '2m': 2, '3m': 3, '4m': 4, '5m': 5, '6m': 6,
      '7m': 7, '8m': 8, '9m': 9, '10m': 10, '12m': 12, '15m': 15,
      '20m': 20, '30m': 30, '45m': 45,
      '1h': 60, '2h': 120, '3h': 180, '4h': 240, '6h': 360,
      '8h': 480, '12h': 720,
      '1d': 1440, '2d': 2880, '3d': 4320,
      '1w': 10080, '2w': 20160,
      '1M': 43200, '3M': 129600, '1Y': 525600
    };

    const minutes = timeframeMinutes[timeframe] || 5;
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const tradingHoursPerDay = 23; // ES trades ~23 hours/day
    const estimatedRows = Math.floor((days * tradingHoursPerDay * 60) / minutes);

    let estimatedTime, warningLevel;
    if (estimatedRows > 200000) {
      estimatedTime = '3-5 minutes';
      warningLevel = 'high';
    } else if (estimatedRows > 100000) {
      estimatedTime = '1-2 minutes';
      warningLevel = 'medium';
    } else if (estimatedRows > 50000) {
      estimatedTime = '30-60 seconds';
      warningLevel = 'low';
    } else {
      estimatedTime = '< 30 seconds';
      warningLevel = 'none';
    }

    return {
      estimatedRows,
      estimatedTime,
      warningLevel,
      days
    };
  }, [timeframe]);

  // Update dates when preset or custom dates change
  useEffect(() => {
    const dates = calculateDates(selectedPreset, customStartDate, customEndDate);
    if (dates && dates.startDate && dates.endDate) {
      const est = estimateDataSize(dates.startDate, dates.endDate);
      setEstimation(est);
      
      // Notify parent components
      onDateRangeChange(dates.startDate, dates.endDate);
      if (onEstimationChange) {
        onEstimationChange(est);
      }
    }
  }, [selectedPreset, customStartDate, customEndDate, calculateDates, estimateDataSize, onDateRangeChange, onEstimationChange]);

  const handlePresetChange = (presetId) => {
    setSelectedPreset(presetId);
    if (presetId === 'custom' && availableRange) {
      // Set default custom dates to last 3 months
      const endDate = new Date(availableRange.maxDate);
      const startDate = new Date(endDate);
      startDate.setMonth(startDate.getMonth() - 3);
      setCustomStartDate(startDate.toISOString().split('T')[0]);
      setCustomEndDate(endDate.toISOString().split('T')[0]);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="date-range-selector loading">
        <FaClock className="spinner" />
        <p>Loading available date ranges...</p>
      </div>
    );
  }

  if (!availableRange) {
    return (
      <div className="date-range-selector error">
        <FaExclamationTriangle />
        <p>Unable to load available date ranges</p>
      </div>
    );
  }

  return (
    <div className="date-range-selector">
      <div className="selector-header">
        <FaCalendar />
        <h4>Select Backtest Period</h4>
      </div>

      <div className="preset-buttons">
        {datePresets.map(preset => (
          <button
            key={preset.id}
            className={`preset-button ${selectedPreset === preset.id ? 'active' : ''}`}
            onClick={() => handlePresetChange(preset.id)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {selectedPreset === 'custom' && (
        <div className="custom-date-inputs">
          <div className="date-input-group">
            <label>Start Date</label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              min={formatDate(availableRange.minDate)}
              max={formatDate(availableRange.maxDate)}
            />
          </div>
          <div className="date-input-group">
            <label>End Date</label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              min={customStartDate || formatDate(availableRange.minDate)}
              max={formatDate(availableRange.maxDate)}
            />
          </div>
        </div>
      )}

      {availableRange && (
        <div className="available-range-info">
          <small>
            Available data: {formatDate(availableRange.minDate)} to {formatDate(availableRange.maxDate)}
          </small>
        </div>
      )}

      {estimation && (
        <div className={`estimation-info warning-${estimation.warningLevel}`}>
          <div className="estimation-row">
            <span className="estimation-label">Estimated data points:</span>
            <span className="estimation-value">{estimation.estimatedRows.toLocaleString()} candles</span>
          </div>
          <div className="estimation-row">
            <span className="estimation-label">Estimated time:</span>
            <span className="estimation-value">{estimation.estimatedTime}</span>
          </div>
          <div className="estimation-row">
            <span className="estimation-label">Period:</span>
            <span className="estimation-value">{estimation.days} days</span>
          </div>
          {estimation.warningLevel !== 'none' && (
            <div className="estimation-warning">
              <FaExclamationTriangle />
              <span>
                {estimation.warningLevel === 'high' 
                  ? 'Large dataset - backtest may take several minutes'
                  : estimation.warningLevel === 'medium'
                  ? 'Medium dataset - backtest may take 1-2 minutes'
                  : 'Moderate dataset - backtest may take up to a minute'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;

