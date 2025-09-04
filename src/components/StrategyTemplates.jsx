import React, { useState, useEffect } from 'react';
import { FaCopy, FaEye, FaChartLine, FaShieldAlt, FaRocket, FaLightbulb } from 'react-icons/fa';
import { quantConnectTemplates } from '../data/quantConnectTemplates';
import { quantConnectAPI } from '../config/api';
import './StrategyTemplates.css';

const StrategyTemplates = ({ onTemplateSelect, onCreateStrategy }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [templates, setTemplates] = useState(quantConnectTemplates);
  const [loading, setLoading] = useState(false);

  // Load templates from API
  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      try {
        const result = await quantConnectAPI.getTemplates();
        if (result.success && result.data) {
          setTemplates(result.data);
        }
      } catch (error) {
        console.error('Error loading templates:', error);
        // Fallback to local templates
        setTemplates(quantConnectTemplates);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  // Get template icons - using a simple rotation
  const getTemplateIcon = (index) => {
    const icons = [<FaChartLine />, <FaRocket />, <FaLightbulb />, <FaShieldAlt />, <FaChartLine />];
    return icons[index % icons.length];
  };

  const handleTemplateSelect = (template) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    } else {
      // Default behavior - navigate to strategy creator with template
      onCreateStrategy(template);
    }
  };

  const handleViewDetails = (template) => {
    setSelectedTemplate(template);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedTemplate(null);
  };



  return (
    <div className="strategy-templates">
      <div className="templates-header">
        <h2><FaLightbulb className="header-icon" /> Strategy Templates</h2>
        <p>Choose from our pre-built strategy templates or get inspired to create your own</p>
      </div>

      <div className="templates-grid">
        {templates.map((template, index) => (
          <div key={template.id} className="template-card">
            <div className="template-header">
              <div className="template-icon">
                {getTemplateIcon(index)}
              </div>
              <div className="template-title">
                <h3>{template.name}</h3>
              </div>
            </div>
            
            <p className="template-description">{template.description}</p>
            
            <div className="template-features">
              <h4>Key Features:</h4>
              <ul>
                {template.features && template.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            
            <div className="template-details">
              <div className="detail-item">
                <strong>Indicators:</strong> {template.indicators ? template.indicators.join(', ') : 'N/A'}
              </div>
              <div className="detail-item">
                <strong>Timeframe:</strong> {template.timeframe || 'N/A'}
              </div>
              <div className="detail-item">
                <strong>Symbols:</strong> {template.symbols ? template.symbols.join(', ') : 'N/A'}
              </div>
            </div>
            
            <div className="template-actions">
              <button
                onClick={() => handleViewDetails(template)}
                className="btn btn-secondary btn-sm"
              >
                <FaEye /> View Details
              </button>
              <button
                onClick={() => handleTemplateSelect(template)}
                className="btn btn-primary btn-sm"
              >
                <FaCopy /> Use Template
              </button>
            </div>
          </div>
        ))}
      </div>

      {showDetails && selectedTemplate && (
        <div className="template-details-modal">
          <div className="modal-overlay" onClick={closeDetails}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedTemplate.name}</h3>
              <button onClick={closeDetails} className="close-btn">&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="template-info">
                <div className="info-row">
                  <span className="label">Description:</span>
                  <p>{selectedTemplate.description}</p>
                </div>
              </div>

              <div className="template-technical">
                <h4>Technical Details:</h4>
                <div className="technical-grid">
                  <div className="tech-item">
                    <strong>Indicators:</strong>
                    <span>{selectedTemplate.indicators ? selectedTemplate.indicators.join(', ') : 'N/A'}</span>
                  </div>
                  <div className="tech-item">
                    <strong>Timeframe:</strong>
                    <span>{selectedTemplate.timeframe || 'N/A'}</span>
                  </div>
                  <div className="tech-item">
                    <strong>Symbols:</strong>
                    <span>{selectedTemplate.symbols ? selectedTemplate.symbols.join(', ') : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="template-natural-language">
                <h4>Natural Language Description:</h4>
                <div className="natural-language-box">
                  <p>"{selectedTemplate.naturalLanguage || selectedTemplate.description}"</p>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={closeDetails} className="btn btn-secondary">
                Close
              </button>
              <button 
                onClick={() => {
                  handleTemplateSelect(selectedTemplate);
                  closeDetails();
                }} 
                className="btn btn-primary"
              >
                <FaCopy /> Use This Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyTemplates;
