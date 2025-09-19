/**
 * Strategy Normalizer
 * Converts frontend rule format to backend API format
 */

/**
 * Normalize rule conditions from frontend format to backend format
 * @param {Array} conditions - Frontend rule conditions
 * @returns {Array} Normalized conditions for backend
 */
export const normalizeRuleConditions = (conditions) => {
  if (!conditions || !Array.isArray(conditions)) {
    return [];
  }

  return conditions.map(condition => ({
    left_operand: condition.left_operand || '',
    operator: condition.operator || 'gt',
    right_operand: condition.right_operand || '',
    logical_operator: condition.logical_operator || 'and'
  }));
};

/**
 * Normalize a single rule from frontend format to backend format
 * @param {Object} rule - Frontend rule object
 * @returns {Object} Normalized rule for backend
 */
export const normalizeRule = (rule) => {
  return {
    name: rule.name || '',
    rule_type: rule.rule_type || 'condition',
    action_type: rule.action_type || 'buy',
    conditions: normalizeRuleConditions(rule.conditions),
    priority: rule.priority || 1,
    parameters: rule.parameters || {}
  };
};

/**
 * Normalize entry and exit rules from frontend format to backend format
 * @param {Array} rules - Array of frontend rules
 * @param {string} section - 'entry' or 'exit'
 * @returns {Array} Normalized rules for backend
 */
export const normalizeRules = (rules, section) => {
  if (!rules || !Array.isArray(rules)) {
    return [];
  }

  return rules
    .filter(rule => rule.section === section)
    .map(rule => normalizeRule(rule));
};

/**
 * Normalize strategy data from frontend format to backend API format
 * @param {Object} strategyData - Frontend strategy data
 * @param {Array} rules - Frontend rules array
 * @returns {Object} Normalized strategy data for backend
 */
export const normalizeStrategyData = (strategyData, rules) => {
  const entryRules = normalizeRules(rules, 'entry');
  const exitRules = normalizeRules(rules, 'exit');

  return {
    name: strategyData.name || '',
    description: strategyData.description || '',
    symbol: strategyData.symbol || 'ES',
    timeframe: strategyData.timeframe || '5m',
    entry_rules: entryRules,
    exit_rules: exitRules,
    stop_loss_type: strategyData.stop_loss_type || 'percentage',
    stop_loss_value: parseFloat(strategyData.stop_loss_value) || 0.5,
    take_profit_type: strategyData.take_profit_type || 'percentage',
    take_profit_value: parseFloat(strategyData.take_profit_value) || 2.0,
    initial_capital: parseFloat(strategyData.initial_capital) || 10000,
    status: strategyData.status || 'DRAFT'  // Use provided status or default to DRAFT
  };
};

/**
 * Validate strategy data before sending to backend
 * @param {Object} strategyData - Strategy data to validate
 * @param {Array} rules - Rules array to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateStrategyData = (strategyData, rules) => {
  const errors = {};

  // Validate basic fields
  if (!strategyData.name || strategyData.name.trim() === '') {
    errors.name = 'Strategy name is required';
  }

  if (!strategyData.description || strategyData.description.trim() === '') {
    errors.description = 'Strategy description is required';
  }

  if (!strategyData.symbol || strategyData.symbol.trim() === '') {
    errors.symbol = 'Symbol is required';
  }

  if (!strategyData.timeframe || strategyData.timeframe.trim() === '') {
    errors.timeframe = 'Timeframe is required';
  }

  // Validate entry rules
  const entryRules = rules.filter(rule => rule.section === 'entry');
  if (entryRules.length === 0) {
    errors.entry_rules = 'At least one entry rule is required';
  }

  // Validate exit rules (optional - can use only stop loss and take profit)
  // const exitRules = rules.filter(rule => rule.section === 'exit');
  // if (exitRules.length === 0) {
  //   errors.exit_rules = 'At least one exit rule is required';
  // }

  // Validate risk management
  if (!strategyData.initial_capital || strategyData.initial_capital <= 0) {
    errors.initial_capital = 'Initial capital must be greater than 0';
  }

  if (!strategyData.stop_loss_value || strategyData.stop_loss_value <= 0) {
    errors.stop_loss_value = 'Stop loss value must be greater than 0';
  }

  if (!strategyData.take_profit_value || strategyData.take_profit_value <= 0) {
    errors.take_profit_value = 'Take profit value must be greater than 0';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Convert backend strategy format to frontend format
 * @param {Object} backendStrategy - Strategy from backend API
 * @returns {Object} Strategy in frontend format
 */
export const denormalizeStrategy = (backendStrategy) => {
  const rules = [];

  // Convert entry rules
  if (backendStrategy.entry_rules && Array.isArray(backendStrategy.entry_rules)) {
    backendStrategy.entry_rules.forEach((rule, index) => {
      rules.push({
        id: `entry_${index}`,
        name: rule.name,
        section: 'entry',
        rule_type: rule.rule_type,
        action_type: rule.action_type,
        conditions: rule.conditions || [],
        priority: rule.priority || 1,
        parameters: rule.parameters || {}
      });
    });
  }

  // Convert exit rules
  if (backendStrategy.exit_rules && Array.isArray(backendStrategy.exit_rules)) {
    backendStrategy.exit_rules.forEach((rule, index) => {
      rules.push({
        id: `exit_${index}`,
        name: rule.name,
        section: 'exit',
        rule_type: rule.rule_type,
        action_type: rule.action_type,
        conditions: rule.conditions || [],
        priority: rule.priority || 1,
        parameters: rule.parameters || {}
      });
    });
  }

  return {
    ...backendStrategy,
    rules
  };
};

/**
 * Get supported enums from backend
 * @returns {Promise<Object>} Supported enums
 */
export const getSupportedEnums = async () => {
  try {
    const response = await fetch('/api/strategies/enums/');
    if (!response.ok) {
      throw new Error('Failed to fetch supported enums');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching supported enums:', error);
    // Return fallback enums
    return {
      symbols: ['ES', 'NQ', 'YM', 'RTY', 'GC', 'SI', 'CL', 'NG'],
      timeframes: ['5m', '15m', '30m', '1h', '4h', '1d'],
      indicators: ['sma_20', 'sma_50', 'ema_20', 'ema_50', 'rsi', 'macd', 'atr'],
      operators: ['gt', 'lt', 'gte', 'lte', 'eq', 'ne', 'cross_up', 'cross_down'],
      stop_loss_types: ['percentage', 'points', 'ticks', 'atr'],
      take_profit_types: ['percentage', 'points', 'ticks', 'atr'],
      strategy_status: ['DRAFT', 'READY', 'ACTIVE', 'INACTIVE'],
      rule_types: ['condition', 'action', 'filter'],
      action_types: ['buy', 'sell', 'close', 'modify', 'wait'],
      logical_operators: ['and', 'or']
    };
  }
};
