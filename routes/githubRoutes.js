const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');

// GitHub routes
router.get('/:username', githubController.getGitHubUser);

module.exports = router;