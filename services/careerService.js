const { recommendCareerDomain, generateLearningRoadmap, calculateCareerReadiness } = require('./aiService');

/**
 * Recommend career domain based on resume data
 */
const recommendCareer = async (resumeData) => {
  try {
    const result = await recommendCareerDomain(resumeData);
    return result;
  } catch (error) {
    console.error('Error recommending career domain:', error);
    throw new Error(`Failed to recommend career domain: ${error.message}`);
  }
};

/**
 * Generate personalized learning roadmap based on resume data and career domain
 */
const generateRoadmap = async (resumeData, careerDomain) => {
  try {
    const result = await generateLearningRoadmap(resumeData, careerDomain);
    return result;
  } catch (error) {
    console.error('Error generating learning roadmap:', error);
    throw new Error(`Failed to generate learning roadmap: ${error.message}`);
  }
};

/**
 * Calculate career readiness score
 */
const calculateReadiness = async (resumeData) => {
  try {
    const result = await calculateCareerReadiness(resumeData);
    return result;
  } catch (error) {
    console.error('Error calculating career readiness:', error);
    throw new Error(`Failed to calculate career readiness: ${error.message}`);
  }
};

module.exports = {
  recommendCareer,
  generateRoadmap,
  calculateReadiness
};