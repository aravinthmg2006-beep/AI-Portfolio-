const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataDir = path.join(__dirname, '../data');
const dataFilePath = path.join(dataDir, 'portfolios.json');

// Ensure the data directory and file exist
const initializeDataFile = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2));
  }
};

let inMemoryPortfolios = [];

// Read all portfolios
const getAllPortfolios = () => {
  try {
    initializeDataFile();
    const data = fs.readFileSync(dataFilePath, 'utf8');
    const diskList = JSON.parse(data || '[]');
    const map = new Map();
    diskList.forEach(p => map.set(p.id, p));
    inMemoryPortfolios.forEach(p => map.set(p.id, p));
    return Array.from(map.values());
  } catch (err) {
    return inMemoryPortfolios;
  }
};

// Save all portfolios
const saveAllPortfolios = (portfolios) => {
  inMemoryPortfolios = portfolios;
  try {
    initializeDataFile();
    fs.writeFileSync(dataFilePath, JSON.stringify(portfolios, null, 2));
  } catch (err) {
    console.warn('Could not persist portfolios.json to disk (using in-memory store):', err.message);
  }
};

// Create a new portfolio or update if matching ID/email
const createPortfolio = (portfolioData) => {
  const portfolios = getAllPortfolios();
  const name = portfolioData.personalInfo?.fullName || portfolioData.personal?.fullName || 'portfolio';
  let slug = generateSlug(name);
  
  // Ensure unique slug
  let counter = 1;
  let originalSlug = slug;
  while (portfolios.some(p => p.slug === slug && p.id !== portfolioData.id)) {
    slug = `${originalSlug}-${counter++}`;
  }

  const id = portfolioData.id || uuidv4();
  const index = portfolios.findIndex(p => p.id === id);

  const newPortfolio = {
    id,
    slug,
    createdAt: portfolioData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    theme: portfolioData.theme || 'midnight-purple',
    personalInfo: portfolioData.personalInfo || portfolioData.personal || {},
    careerDomain: portfolioData.careerDomain || { selected: '', recommended: '', reason: '' },
    skills: portfolioData.skills || [],
    projects: portfolioData.projects || [],
    education: portfolioData.education || [],
    experience: portfolioData.experience || [],
    certifications: portfolioData.certifications || [],
    languages: portfolioData.languages || [],
    achievements: portfolioData.achievements || [],
    atsAnalysis: portfolioData.atsAnalysis || { score: 0, breakdown: {}, suggestions: [], estimatedPotentialScore: 0 },
    careerReadiness: portfolioData.careerReadiness || { score: 0, breakdown: {} },
    learningRoadmap: portfolioData.learningRoadmap || {},
    githubData: portfolioData.githubData || {},
    socialLinks: portfolioData.socialLinks || portfolioData.social || {},
    profilePhoto: portfolioData.profilePhoto || null,
    resumeFile: portfolioData.resumeFile || null
  };

  if (index !== -1) {
    portfolios[index] = newPortfolio;
  } else {
    portfolios.push(newPortfolio);
  }

  saveAllPortfolios(portfolios);
  return newPortfolio;
};

// Get portfolio by ID
const getPortfolioById = (id) => {
  const portfolios = getAllPortfolios();
  return portfolios.find(p => p.id === id) || null;
};

// Get portfolio by slug
const getPortfolioBySlug = (slug) => {
  const portfolios = getAllPortfolios();
  return portfolios.find(p => p.slug === slug.toLowerCase()) || null;
};

// Update portfolio by ID
const updatePortfolio = (id, updateData) => {
  const portfolios = getAllPortfolios();
  const index = portfolios.findIndex(p => p.id === id);
  if (index === -1) return null;

  portfolios[index] = {
    ...portfolios[index],
    ...updateData,
    updatedAt: new Date().toISOString()
  };

  saveAllPortfolios(portfolios);
  return portfolios[index];
};

// Delete portfolio by ID
const deletePortfolio = (id) => {
  const portfolios = getAllPortfolios();
  const index = portfolios.findIndex(p => p.id === id);
  if (index === -1) return false;

  portfolios.splice(index, 1);
  saveAllPortfolios(portfolios);
  return true;
};

// Generate a slug from a string
const generateSlug = (text) => {
  if (!text) return 'portfolio';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

module.exports = {
  createPortfolio,
  getPortfolioById,
  getPortfolioBySlug,
  updatePortfolio,
  deletePortfolio,
  getAllPortfolios,
  generateSlug
};