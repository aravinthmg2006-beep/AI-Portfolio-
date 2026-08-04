const resumeParser = require('../services/resumeParser');
const aiService = require('../services/aiService');
const atsService = require('../services/atsService');
const careerService = require('../services/careerService');

/**
 * Handle resume and profile picture upload
 */
const uploadResume = async (req, res) => {
  try {
    const resumeFile = req.files && req.files.resume ? req.files.resume[0] : null;
    const photoFile = req.files && req.files.photo ? req.files.photo[0] : null;

    if (!resumeFile) {
      return res.status(400).json({ message: 'Resume PDF file is required' });
    }

    // Save profile picture if uploaded
    let profilePhotoPath = null;
    if (photoFile) {
      profilePhotoPath = await resumeParser.saveUploadedFile(photoFile, 'profiles');
    }

    // Parse resume text using pdf-parse
    const resumeText = await resumeParser.parseResumePDF(resumeFile);
    const resumePdfPath = await resumeParser.saveUploadedFile(resumeFile, 'resumes');

    res.status(200).json({
      message: 'Resume uploaded and parsed successfully',
      data: {
        resumeText,
        resumePdfPath,
        profilePhotoPath
      }
    });
  } catch (error) {
    console.error('Error uploading resume:', error.message);
    res.status(400).json({ message: error.message || 'Unable to read this resume. Please upload a valid text-based PDF.' });
  }
};

/**
 * Analyze resume text with Gemini AI
 */
const analyzeResume = async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      return res.status(400).json({ message: 'Resume text is required' });
    }

    const analysis = await aiService.analyzeResume(resumeText);
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error analyzing resume:', error.message);
    res.status(500).json({ message: 'Failed to analyze resume' });
  }
};

/**
 * Calculate ATS score
 */
const calculateATSScore = async (req, res) => {
  try {
    const { resumeData, careerDomain } = req.body;
    if (!resumeData) {
      return res.status(400).json({ message: 'Resume data is required' });
    }

    const atsResult = await atsService.calculateATS(resumeData, careerDomain || "Full Stack Development");
    res.status(200).json(atsResult);
  } catch (error) {
    console.error('Error calculating ATS score:', error.message);
    res.status(500).json({ message: 'Failed to calculate ATS score' });
  }
};

/**
 * Recommend career domain
 */
const recommendCareerDomain = async (req, res) => {
  try {
    const { resumeData } = req.body;
    if (!resumeData) {
      return res.status(400).json({ message: 'Resume data is required' });
    }

    const recommendation = await careerService.recommendCareer(resumeData);
    res.status(200).json(recommendation);
  } catch (error) {
    console.error('Error recommending career domain:', error.message);
    res.status(500).json({ message: 'Failed to recommend career domain' });
  }
};

/**
 * Generate learning roadmap
 */
const generateLearningRoadmap = async (req, res) => {
  try {
    const { resumeData, careerDomain } = req.body;
    if (!resumeData) {
      return res.status(400).json({ message: 'Resume data is required' });
    }

    const roadmap = await careerService.generateRoadmap(resumeData, careerDomain || "Full Stack Development");
    res.status(200).json(roadmap);
  } catch (error) {
    console.error('Error generating learning roadmap:', error.message);
    res.status(500).json({ message: 'Failed to generate learning roadmap' });
  }
};

/**
 * Calculate Career Readiness Score
 */
const calculateCareerReadiness = async (req, res) => {
  try {
    const { resumeData } = req.body;
    if (!resumeData) {
      return res.status(400).json({ message: 'Resume data is required' });
    }

    const readiness = await careerService.calculateReadiness(resumeData);
    res.status(200).json(readiness);
  } catch (error) {
    console.error('Error calculating career readiness:', error.message);
    res.status(500).json({ message: 'Failed to calculate career readiness score' });
  }
};

module.exports = {
  uploadResume,
  analyzeResume,
  calculateATSScore,
  recommendCareerDomain,
  generateLearningRoadmap,
  calculateCareerReadiness
};