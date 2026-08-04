const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const multer = require('multer');

// Memory storage for multer processing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Multer fields handler for resume PDF and optional profile photo
const uploadFields = upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'photo', maxCount: 1 }
]);

router.post('/upload', uploadFields, resumeController.uploadResume);
router.post('/analyze', resumeController.analyzeResume);
router.post('/ats-score', resumeController.calculateATSScore);
router.post('/career-domain', resumeController.recommendCareerDomain);
router.post('/roadmap', resumeController.generateLearningRoadmap);
router.post('/readiness', resumeController.calculateCareerReadiness);

module.exports = router;