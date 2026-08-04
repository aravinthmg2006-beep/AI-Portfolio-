const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directories exist
const uploadResumesDir = path.join(__dirname, 'uploads', 'resumes');
const uploadProfilesDir = path.join(__dirname, 'uploads', 'profiles');
if (!fs.existsSync(uploadResumesDir)) fs.mkdirSync(uploadResumesDir, { recursive: true });
if (!fs.existsSync(uploadProfilesDir)) fs.mkdirSync(uploadProfilesDir, { recursive: true });

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/portfolio', require('./routes/portfolioRoutes'));
app.use('/api/resume', require('./routes/resumeRoutes'));
app.use('/api/github', require('./routes/githubRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// HTML Page Routes for client navigation
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/review', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'review.html'));
});

app.get('/portfolio/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'portfolio.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Catch-all for API 404
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API Route not found' });
});

// Fallback to index.html for all other routes
app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ message: 'Something went wrong while processing your request.' });
});

app.listen(PORT, () => {
  console.log(`AI Career Portfolio server is running on http://localhost:${PORT}`);
});

module.exports = app;