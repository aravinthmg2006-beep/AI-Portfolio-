const portfolioStorage = require('../services/portfolioStorage');

/**
 * Create a new portfolio
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createPortfolio = async (req, res) => {
  try {
    const portfolioData = req.body;
    const newPortfolio = portfolioStorage.createPortfolio(portfolioData);
    res.status(201).json(newPortfolio);
  } catch (error) {
    console.error('Error creating portfolio:', error);
    res.status(500).json({ message: 'Failed to create portfolio' });
  }
};

/**
 * Get portfolio by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPortfolioById = async (req, res) => {
  try {
    const { id } = req.params;
    const portfolio = portfolioStorage.getPortfolioById(id);
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }
    res.status(200).json(portfolio);
  } catch (error) {
    console.error('Error getting portfolio by ID:', error);
    res.status(500).json({ message: 'Failed to get portfolio' });
  }
};

/**
 * Get portfolio by slug
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPortfolioBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const portfolio = portfolioStorage.getPortfolioBySlug(slug);
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }
    res.status(200).json(portfolio);
  } catch (error) {
    console.error('Error getting portfolio by slug:', error);
    res.status(500).json({ message: 'Failed to get portfolio' });
  }
};

/**
 * Update portfolio by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedPortfolio = portfolioStorage.updatePortfolio(id, updateData);
    if (!updatedPortfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }
    res.status(200).json(updatedPortfolio);
  } catch (error) {
    console.error('Error updating portfolio:', error);
    res.status(500).json({ message: 'Failed to update portfolio' });
  }
};

/**
 * Delete portfolio by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deletePortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = portfolioStorage.deletePortfolio(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }
    res.status(200).json({ message: 'Portfolio deleted successfully' });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    res.status(500).json({ message: 'Failed to delete portfolio' });
  }
};

module.exports = {
  createPortfolio,
  getPortfolioById,
  getPortfolioBySlug,
  updatePortfolio,
  deletePortfolio
};