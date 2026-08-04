const githubService = require('../services/githubService');

/**
 * Get GitHub user data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getGitHubUser = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ message: 'GitHub username is required' });
    }

    const githubData = await githubService.fetchGitHubUser(username);
    res.status(200).json(githubData);
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    // Return a friendly error but don't expose internal details
    res.status(500).json({ message: 'Failed to fetch GitHub data' });
  }
};

module.exports = {
  getGitHubUser
};