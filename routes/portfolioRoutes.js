const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

// Portfolio routes
router.post('/create', portfolioController.createPortfolio);
router.post('/', portfolioController.createPortfolio);
router.get('/slug/:slug', portfolioController.getPortfolioBySlug);
router.get('/:id', portfolioController.getPortfolioById);
router.put('/:id', portfolioController.updatePortfolio);
router.delete('/:id', portfolioController.deletePortfolio);

module.exports = router;