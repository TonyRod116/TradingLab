/**
 * Clean strategy name by removing timestamps and other unwanted suffixes
 * @param {string} name - Original strategy name
 * @returns {string} - Cleaned strategy name
 */
export const cleanStrategyName = (name) => {
  if (!name) return 'Unnamed Strategy';
  
  // Remove timestamp patterns like "20250902T153314" or "20250902"
  let cleaned = name.replace(/\d{8}T\d{6}/g, ''); // Remove YYYYMMDDTHHMMSS
  cleaned = cleaned.replace(/\d{8}/g, ''); // Remove YYYYMMDD
  
  // Remove multiple underscores or numbers at the end
  cleaned = cleaned.replace(/[_0-9]+$/, '');
  
  // Remove trailing underscores
  cleaned = cleaned.replace(/_+$/, '');
  
  // If the name is empty after cleaning, return a default
  if (!cleaned.trim()) {
    return 'Unnamed Strategy';
  }
  
  return cleaned.trim();
};

/**
 * Format strategy name for display
 * @param {string} name - Strategy name
 * @returns {string} - Formatted name
 */
export const formatStrategyName = (name) => {
  const cleaned = cleanStrategyName(name);
  
  // Capitalize first letter of each word
  return cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
