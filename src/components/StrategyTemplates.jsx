import React, { useState } from 'react';
import { FaCopy, FaEye, FaChartLine, FaShieldAlt, FaRocket, FaLightbulb } from 'react-icons/fa';
import { strategyTemplates } from '../data/strategyTemplates';
import './StrategyTemplates.css';

const StrategyTemplates = ({ onTemplateSelect, onCreateStrategy }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

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
        {strategyTemplates.map((template, index) => (
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
                {template.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            
            <div className="template-rules-summary">
              <div className="rules-count">
                <span className="entry-rules">{template.entryRules.length} Entry Rules</span>
                <span className="exit-rules">{template.exitRules.length} Exit Rules</span>
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

              <div className="rules-details">
                <div className="rules-section">
                  <h4>Entry Rules ({selectedTemplate.entryRules.length})</h4>
                  {selectedTemplate.entryRules.map((rule, index) => (
                    <div key={index} className="rule-item">
                      <strong>{rule.name}</strong>
                      <div className="rule-conditions">
                        {rule.conditions.map((condition, condIndex) => (
                          <div key={condIndex} className="condition">
                            {condition.left_operand} {condition.operator} {condition.right_operand}
                            {condIndex < rule.conditions.length - 1 && (
                              <span className="logical-op"> {condition.logical_operator}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rules-section">
                  <h4>Exit Rules ({selectedTemplate.exitRules.length})</h4>
                  {selectedTemplate.exitRules.map((rule, index) => (
                    <div key={index} className="rule-item">
                      <strong>{rule.name}</strong>
                      <div className="rule-conditions">
                        {rule.conditions.map((condition, condIndex) => (
                          <div key={condIndex} className="condition">
                            {condition.left_operand} {condition.operator} {condition.right_operand}
                            {condIndex < rule.conditions.length - 1 && (
                              <span className="logical-op"> {condition.logical_operator}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
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
