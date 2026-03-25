const express = require('express');
const router = express.Router();
const {
  getResourceReviews,
  createResourceReview,
  createExpertReview,
  getSessionExpertReviews,
  getExpertReviews
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Resource reviews
router.get('/resource/:resourceId', protect, getResourceReviews);
router.post('/resource', protect, createResourceReview);

// Expert/Session reviews
router.get('/expert/:expertId', protect, getExpertReviews);
router.get('/session/:sessionId/expert', protect, getSessionExpertReviews);
router.post('/expert', protect, createExpertReview);

module.exports = router;
