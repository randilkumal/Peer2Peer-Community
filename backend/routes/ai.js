const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  suggestResources,
  recommendSessions,
  suggestSessionVideos,
  generateQuiz
} = require('../controllers/aiController');

// @route   GET /api/ai/suggest-resources
// @desc    Get AI resource suggestions
// @access  Private
router.get('/suggest-resources', protect, suggestResources);

// @route   GET /api/ai/recommend-sessions
// @desc    Get AI session recommendations (internal sessions)
// @access  Private
router.get('/recommend-sessions', protect, recommendSessions);

// @route   GET /api/ai/suggest-session-videos
// @desc    Get YouTube‑only session video suggestions based on a query
// @access  Private
router.get('/suggest-session-videos', protect, suggestSessionVideos);

// POST /api/ai/generate-quiz
const upload = require('../middleware/upload');
router.post('/generate-quiz', upload.single('file'), generateQuiz);

module.exports = router;
