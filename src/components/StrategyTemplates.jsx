import React, { useState, useEffect } from 'react';
import { FaCopy, FaEye, FaChartLine, FaShieldAlt, FaRocket, FaLightbulb, FaPlay, FaCode } from 'react-icons/fa';
import { quantConnectTemplates } from '../data/quantConnectTemplates';
import QuantConnectService from '../services/QuantConnectService';
import QuantConnectStatusBar from './QuantConnectStatusBar';
import './StrategyTemplates.css';

const StrategyTemplates = ({ onTemplateSelect, onCreateStrategy }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [templates, setTemplates] = useState(quantConnectTemplates);
  const [loading, setLoading] = useState(false);
  const [runningBacktest, setRunningBacktest] = useState(false);
  const [backtestResults, setBacktestResults] = useState(null);
  const [backtestError, setBacktestError] = useState(null);
  const [statusData, setStatusData] = useState({
    projectId: null,
    compileId: null,
    backtestId: null
  });

  // Crear instancia del servicio
  const quantConnectService = new QuantConnectService();

  // Debug: Log templates on load
  useEffect(() => {
    console.log('📋 Templates loaded:', templates.length);
    templates.forEach((template, index) => {
      console.log(`Template ${index + 1}:`, {
        name: template.name,
        hasPythonCode: !!template.pythonCode,
        pythonCodeLength: template.pythonCode?.length || 0
      });
    });
  }, [templates]);

  // Load templates from API
  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      try {
        // For now, we'll use the local templates
        // In the future, you can load from API here
        console.log('📋 Using local templates');
        setTemplates(quantConnectTemplates);
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

  // Function to run QuantConnect backtest
  const handleRunQuantConnectBacktest = async (template) => {
    console.log('🚀 handleRunQuantConnectBacktest called with template:', template);
    
    if (!template.pythonCode) {
      console.error('❌ Template does not have Python code');
      setBacktestError('This template does not have Python code available');
      return;
    }

    console.log('✅ Starting backtest process...');
    setRunningBacktest(true);
    setBacktestError(null);
    setBacktestResults(null);
    setStatusData({ projectId: null, compileId: null, backtestId: null });

    try {
      const strategyData = {
        name: template.name,
        code: template.pythonCode
      };

      console.log('📋 Template data being sent:');
      console.log('📝 Name:', template.name);
      console.log('🐍 Python code available:', !!template.pythonCode);
      console.log('📏 Code length:', template.pythonCode?.length || 0);

      const result = await quantConnectService.runCompleteBacktest(strategyData);
      
      if (result.success) {
        setBacktestResults(result.results);
        setStatusData({
          projectId: result.results.project_id,
          compileId: result.results.compile_id,
          backtestId: result.results.backtest_id
        });
        // Don't set runningBacktest to false here - let the status bar handle it
      } else {
        setBacktestError(result.error || 'Error running backtest');
        setRunningBacktest(false);
      }
    } catch (error) {
      setBacktestError(error.message);
      setRunningBacktest(false);
    }
    // Remove the finally block that was setting runningBacktest to false
  };

  // Handle backtest status changes
  const handleStatusChange = (status) => {
    console.log('Backtest status changed:', status);
  };

  // Handle backtest completion
  const handleBacktestComplete = () => {
    console.log('Backtest completed!');
    setRunningBacktest(false);
    // Optionally refresh results or show completion message
  };



  return (
    <div className="strategy-templates">
      <div className="templates-header">
        <h2><FaLightbulb className="header-icon" /> Strategy Templates</h2>
        <p>Choose from our pre-built strategy templates or get inspired to create your own</p>
        
        {/* Debug button */}
        <button 
          onClick={() => {
            console.log('🧪 Debug button clicked');
            console.log('Templates:', templates);
            console.log('First template pythonCode:', templates[0]?.pythonCode?.substring(0, 100));
          }}
          style={{
            backgroundColor: 'red', 
            color: 'white', 
            padding: '10px', 
            margin: '10px',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          🧪 Debug Button
        </button>
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
              {template.pythonCode ? (
                <button
                  onClick={() => {
                    console.log('🔘 Run QC Backtest button clicked for template:', template.name);
                    console.log('🔍 Template pythonCode length:', template.pythonCode?.length);
                    handleRunQuantConnectBacktest(template);
                  }}
                  disabled={runningBacktest}
                  className="btn btn-quantconnect btn-sm"
                  style={{backgroundColor: '#10b981', color: 'white'}}
                >
                  {runningBacktest ? <FaRocket className="spinning" /> : <FaPlay />} 
                  {runningBacktest ? 'Running...' : 'Run QC Backtest'}
                </button>
              ) : (
                <div style={{color: 'red', fontSize: '12px', padding: '5px'}}>
                  No Python code
                </div>
              )}
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

              {selectedTemplate.pythonCode && (
                <div className="template-code">
                  <h4><FaCode /> Python Code:</h4>
                  <div className="code-container">
                    <pre className="code-block">{selectedTemplate.pythonCode}</pre>
                  </div>
                </div>
              )}
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
              {selectedTemplate.pythonCode && (
                <button
                  onClick={() => {
                    console.log('🔘 Run QC Backtest button clicked in modal for template:', selectedTemplate.name);
                    handleRunQuantConnectBacktest(selectedTemplate);
                    closeDetails();
                  }}
                  disabled={runningBacktest}
                  className="btn btn-quantconnect"
                >
                  {runningBacktest ? <FaRocket className="spinning" /> : <FaPlay />} 
                  {runningBacktest ? 'Running...' : 'Run QC Backtest'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Bar for QuantConnect Backtest */}
      {runningBacktest && (
        <div className="backtest-status-container">
          <h3>🚀 Running QuantConnect Backtest</h3>
          <QuantConnectStatusBar
            projectId={statusData.projectId}
            compileId={statusData.compileId}
            backtestId={statusData.backtestId}
            onStatusChange={handleStatusChange}
            onComplete={handleBacktestComplete}
          />
        </div>
      )}

      {/* Backtest Error */}
      {backtestError && (
        <div className="backtest-error">
          <h3>❌ Backtest Error</h3>
          <div className="error-message">
            {backtestError}
          </div>
        </div>
      )}

      {/* Backtest Results */}
      {backtestResults && (
        <div className="backtest-results">
          <h3>📊 Backtest Results</h3>
          <div className="results-container">
            <pre>{JSON.stringify(backtestResults, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyTemplates;
