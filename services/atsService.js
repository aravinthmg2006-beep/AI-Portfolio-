const { calculateATSScore } = require('./aiService');

/**
 * Calculate ATS score for resume data based on career domain
 */
const calculateATS = async (resumeData, careerDomain) => {
  try {
    const result = await calculateATSScore(resumeData, careerDomain);
    return result;
  } catch (error) {
    console.error('Error calculating ATS score:', error);
    throw new Error(`Failed to calculate ATS score: ${error.message}`);
  }
};

/**
 * Generate ATS improvement suggestions based on score breakdown
 */
const generateATSSuggestions = (atsResult) => {
  const { suggestions = [] } = atsResult;

  const grouped = {
    critical: [],
    high: [],
    medium: [],
    optional: []
  };

  suggestions.forEach(suggestion => {
    const priority = (suggestion.priority || 'medium').toLowerCase();
    if (grouped.hasOwnProperty(priority)) {
      grouped[priority].push(suggestion);
    } else {
      grouped.medium.push(suggestion);
    }
  });

  return grouped;
};

/**
 * Calculate estimated potential score after implementing suggestions
 */
const calculatePotentialScore = (atsResult) => {
  const { score = 70 } = atsResult;
  return Math.min(100, score + 16);
};

module.exports = {
  calculateATS,
  generateATSSuggestions,
  calculatePotentialScore
};