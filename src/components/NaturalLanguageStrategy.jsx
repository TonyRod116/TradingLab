import React, { useState, useCallback } from 'react';
import { FaMagic, FaEye, FaSave, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { normalizeStrategyData, validateStrategyData } from '../utils/strategyNormalizer.js';
import './NaturalLanguageStrategy.css';

const NaturalLanguageStrategy = ({ onStrategyCreated, onBack }) => {
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [parsedStrategy, setParsedStrategy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Example natural language patterns
  const examplePatterns = [
    "Buy EURUSD on H4 when price crosses above SMA(20) and RSI(14) < 30. SL 1%, TP 2%, capital 10k.",
    "Sell ES futures on 5m when RSI > 70 and MACD shows bearish divergence. Stop loss 2%, take profit 4%.",
    "Trade Gold on 1h using Bollinger Bands mean reversion. Buy when price touches lower band, sell at upper band.",
    "Scalp Bitcoin on 1m using VWAP. Buy when price is below VWAP and RSI is oversold."
  ];

  // Simple natural language parser
  const parseNaturalLanguage = useCallback((input) => {
    const strategy = {
      name: `NL Strategy ${new Date().toISOString().slice(0, 10)}`,
      description: input,
      symbol: 'ES',
      timeframe: '1m',
      initial_capital: 10000,
      stop_loss_type: 'percentage',
      stop_loss_value: 1.0,
      take_profit_type: 'percentage',
      take_profit_value: 2.0
    };

    const rules = [];

    // Simple pattern matching
    const lowerInput = input.toLowerCase();

    // Detect symbol
    if (lowerInput.includes('eurusd') || lowerInput.includes('eur/usd')) {
      strategy.symbol = 'EURUSD';
    } else if (lowerInput.includes('gbpusd') || lowerInput.includes('gbp/usd')) {
      strategy.symbol = 'GBPUSD';
    } else if (lowerInput.includes('bitcoin') || lowerInput.includes('btc')) {
      strategy.symbol = 'BTC';
    } else if (lowerInput.includes('gold')) {
      strategy.symbol = 'GC';
    }

    // Detect timeframe
    if (lowerInput.includes('h4') || lowerInput.includes('4h')) {
      strategy.timeframe = '4h';
    } else if (lowerInput.includes('h1') || lowerInput.includes('1h')) {
      strategy.timeframe = '1h';
    } else if (lowerInput.includes('5m')) {
      strategy.timeframe = '5m';
    } else if (lowerInput.includes('1m')) {
      strategy.timeframe = '1m';
    }

    // Detect capital
    const capitalMatch = input.match(/(\d+)k|(\d+)\s*thousand/i);
    if (capitalMatch) {
      const value = capitalMatch[1] || capitalMatch[2];
      strategy.initial_capital = parseInt(value) * 1000;
    }

    // Detect stop loss
    const slMatch = input.match(/sl\s*(\d+(?:\.\d+)?)%?/i);
    if (slMatch) {
      strategy.stop_loss_value = parseFloat(slMatch[1]);
    }

    // Detect take profit
    const tpMatch = input.match(/tp\s*(\d+(?:\.\d+)?)%?/i);
    if (tpMatch) {
      strategy.take_profit_value = parseFloat(tpMatch[1]);
    }

    // Create basic entry rule
    const entryRule = {
      id: 'entry_1',
      name: 'Natural Language Entry',
      section: 'entry',
      rule_type: 'condition',
      action_type: 'buy',
      conditions: [
        {
          left_operand: 'rsi',
          operator: 'lt',
          right_operand: 'rsi_30',
          logical_operator: 'and'
        }
      ],
      priority: 1,
      parameters: {}
    };

    // Create basic exit rule
    const exitRule = {
      id: 'exit_1',
      name: 'Natural Language Exit',
      section: 'exit',
      rule_type: 'condition',
      action_type: 'sell',
      conditions: [
        {
          left_operand: 'rsi',
          operator: 'gt',
          right_operand: 'rsi_70',
          logical_operator: 'and'
        }
      ],
      priority: 1,
      parameters: {}
    };

    rules.push(entryRule, exitRule);

    return { strategy, rules };
  }, []);

  const handleParse = useCallback(async () => {
    if (!naturalLanguageInput.trim()) {
      toast.error('Please enter a strategy description');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result = parseNaturalLanguage(naturalLanguageInput);
      setParsedStrategy(result);
      setPreviewMode(true);
      toast.success('Strategy parsed successfully!');
    } catch (error) {
      toast.error('Failed to parse strategy: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [naturalLanguageInput, parseNaturalLanguage]);

  const handleSaveStrategy = useCallback(async () => {
    if (!parsedStrategy) return;

    try {
      const { strategy, rules } = parsedStrategy;
      const validation = validateStrategyData(strategy, rules);
      if (!validation.isValid) {
        toast.error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
        return;
      }

      const normalizedData = normalizeStrategyData(strategy, rules);
      onStrategyCreated(normalizedData, rules);
      toast.success('Strategy created successfully!');
    } catch (error) {
      toast.error('Failed to save strategy: ' + error.message);
    }
  }, [parsedStrategy, onStrategyCreated]);

  const handleExampleClick = useCallback((example) => {
    setNaturalLanguageInput(example);
  }, []);

  const handleBackToInput = useCallback(() => {
    setPreviewMode(false);
    setParsedStrategy(null);
  }, []);

  return (
    <div className="natural-language-strategy">
      <div className="nl-header">
        <h2>🎯 Natural Language Strategy Creator</h2>
        <p>Describe your trading strategy in plain English and we'll convert it to executable rules</p>
      </div>

      {!previewMode ? (
        <div className="nl-input-section">
          <div className="input-group">
            <label htmlFor="strategy-description">Strategy Description</label>
            <textarea
              id="strategy-description"
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              placeholder="Describe your trading strategy..."
              rows="4"
            />
          </div>

          <div className="examples-section">
            <h4>Example Strategies</h4>
            <div className="examples-grid">
              {examplePatterns.map((example, index) => (
                <button
                  key={index}
                  className="example-button"
                  onClick={() => handleExampleClick(example)}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="nl-actions">
            <button onClick={onBack} className="btn btn-secondary">
              Back to Strategies
            </button>
            <button
              onClick={handleParse}
              disabled={loading || !naturalLanguageInput.trim()}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <FaSpinner className="spinner" /> Parsing...
                </>
              ) : (
                <>
                  <FaMagic /> Parse Strategy
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="nl-preview-section">
          <div className="preview-header">
            <h3>📋 Parsed Strategy Preview</h3>
            <button onClick={handleBackToInput} className="btn btn-secondary btn-sm">
              Edit Description
            </button>
          </div>

          {parsedStrategy && (
            <div className="strategy-preview">
              <div className="preview-section">
                <h4>Basic Information</h4>
                <div className="preview-grid">
                  <div className="preview-item">
                    <span className="label">Name:</span>
                    <span className="value">{parsedStrategy.strategy.name}</span>
                  </div>
                  <div className="preview-item">
                    <span className="label">Symbol:</span>
                    <span className="value">{parsedStrategy.strategy.symbol}</span>
                  </div>
                  <div className="preview-item">
                    <span className="label">Timeframe:</span>
                    <span className="value">{parsedStrategy.strategy.timeframe}</span>
                  </div>
                  <div className="preview-item">
                    <span className="label">Capital:</span>
                    <span className="value">${parsedStrategy.strategy.initial_capital.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="preview-section">
                <h4>Risk Management</h4>
                <div className="preview-grid">
                  <div className="preview-item">
                    <span className="label">Stop Loss:</span>
                    <span className="value">{parsedStrategy.strategy.stop_loss_value}%</span>
                  </div>
                  <div className="preview-item">
                    <span className="label">Take Profit:</span>
                    <span className="value">{parsedStrategy.strategy.take_profit_value}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="preview-actions">
            <button onClick={handleBackToInput} className="btn btn-secondary">
              <FaEye /> Edit Description
            </button>
            <button onClick={handleSaveStrategy} className="btn btn-primary">
              <FaSave /> Create Strategy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NaturalLanguageStrategy;