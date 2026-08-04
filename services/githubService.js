/**
 * Fetch GitHub user data using global fetch
 * @param {string} username - GitHub username or profile URL
 * @returns {Promise<Object>} GitHub user data
 */
const fetchGitHubUser = async (username) => {
  try {
    if (!username) {
      throw new Error('GitHub username is required');
    }

    const cleanUsername = extractGitHubUsername(username);
    if (!cleanUsername) {
      throw new Error('Invalid GitHub username or URL');
    }

    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'AI-Career-Portfolio-App'
    };

    const userResponse = await fetch(`https://api.github.com/users/${cleanUsername}`, { headers });

    if (!userResponse.ok) {
      if (userResponse.status === 404) {
        throw new Error('GitHub user not found');
      }
      throw new Error(`GitHub API error: ${userResponse.status}`);
    }

    const data = await userResponse.json();

    // Fetch user public repositories
    const reposResponse = await fetch(`https://api.github.com/users/${cleanUsername}/repos?sort=updated&per_page=6`, { headers });

    let repos = [];
    if (reposResponse.ok) {
      repos = await reposResponse.json();
    }

    return {
      profile: {
        login: data.login,
        id: data.id,
        avatar_url: data.avatar_url,
        html_url: data.html_url,
        name: data.name || data.login,
        company: data.company,
        blog: data.blog,
        location: data.location,
        email: data.email,
        bio: data.bio,
        twitter_username: data.twitter_username,
        public_repos: data.public_repos,
        public_gists: data.public_gists,
        followers: data.followers,
        following: data.following,
        created_at: data.created_at,
        updated_at: data.updated_at
      },
      repositories: repos.map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        watchers_count: repo.watchers_count,
        updated_at: repo.updated_at
      }))
    };
  } catch (error) {
    console.error('Error fetching GitHub data:', error.message);
    throw new Error(`Failed to fetch GitHub data: ${error.message}`);
  }
};

/**
 * Clean and extract username from URL or raw input
 */
const extractGitHubUsername = (input) => {
  if (!input) return null;
  let username = input.trim();
  username = username.replace(/^https?:\/\/(www\.)?github.com\//i, '');
  username = username.replace(/\/+$/, '');
  username = username.replace(/^@/, '');
  const parts = username.split('/');
  return parts[0] || null;
};

module.exports = {
  fetchGitHubUser,
  extractGitHubUsername
};