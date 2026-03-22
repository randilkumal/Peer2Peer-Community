const Review = require('../models/Review');
const Resource = require('../models/Resource');
const User = require('../models/User');
const Session = require('../models/Session');

function reviewerId(req) {
  const u = req.user;
  if (!u) return null;
  return u._id || u.id;
}

// @desc    Get reviews for a resource
// @route   GET /api/reviews/resource/:resourceId
// @access  Private
exports.getResourceReviews = async (req, res) => {
  try {
    console.log('=== GET RESOURCE REVIEWS DEBUG ===');
    console.log('Resource ID:', req.params.resourceId);

    // NOTE: legacy fields `resourceId` / `type` are kept for backward compatibility.
    // New schema uses `reviewType` and `resource`.
    const reviews = await Review.find({
      $or: [
        { reviewType: 'resource', resource: req.params.resourceId },
        { type: 'resource', resourceId: req.params.resourceId }
      ]
    })
      .populate('reviewer', 'name fullName email profilePicture role')
      .sort('-createdAt');

    console.log(`Found ${reviews.length} reviews`);

    res.json({
      success: true,
      reviews: reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// @desc    Create a review for a resource
// @route   POST /api/reviews/resource
// @access  Private
exports.createResourceReview = async (req, res) => {
  try {
    const rid = reviewerId(req);
    if (!rid) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { resourceId, rating: rawRating, comment } = req.body;
    const rating = Number(rawRating);

    if (!resourceId || !rawRating || Number.isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Resource ID and a valid rating (1–5) are required'
      });
    }

    // Check if resource exists
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Prevent creator from reviewing their own resource
    if (resource.uploadedBy && resource.uploadedBy.toString() === rid.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot review your own uploaded resource.'
      });
    }

    // Check if user already reviewed this resource
    const existingReview = await Review.findOne({
      reviewer: rid,
      $or: [
        { reviewType: 'resource', resource: resourceId },
        { type: 'resource', resourceId }
      ]
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this resource'
      });
    }

    // Create review
    const review = await Review.create({
      reviewType: 'resource',
      resource: resourceId,
      reviewer: rid,
      rating,
      comment
    });

    await review.populate('reviewer', 'name fullName email profilePicture');

    // Update resource average rating
    const allReviews = await Review.find({
      $or: [
        { reviewType: 'resource', resource: resourceId },
        { type: 'resource', resourceId }
      ]
    });
    
    // Calculate average safely
    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
      : 0;
    
    // Use updateOne to bypass schema validation errors on old documents
    await Resource.updateOne(
      { _id: resourceId },
      { $set: { averageRating: avgRating, ratingCount: allReviews.length } }
    );

    res.status(201).json({
      success: true,
      review
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this resource'
      });
    }
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
};

// @desc    Create a review for an expert / session
// @route   POST /api/reviews/expert
// @access  Private
exports.createExpertReview = async (req, res) => {
  try {
    const rid = reviewerId(req);
    if (!rid) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { expertId, sessionId, rating: rawRating, comment } = req.body;
    const rating = Number(rawRating);

    if (!expertId || !sessionId || !rawRating || Number.isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Expert, session and a valid rating (1–5) are required'
      });
    }

    const session = await Session.findById(sessionId).populate('participants', '_id');
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Only allow reviews for completed sessions
    if (session.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed sessions'
      });
    }

    // Must have participated in the session (or be assigned expert — experts typically don't rate themselves)
    const userId = rid.toString();
    const isParticipant = session.participants.some(
      (p) => (p._id || p).toString() === userId
    );
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You can only review sessions you attended'
      });
    }

    // Prevent duplicate review for same expert + session + reviewer
    const existing = await Review.findOne({
      reviewType: 'expert',
      expert: expertId,
      session: sessionId,
      reviewer: rid
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this session'
      });
    }

    const review = await Review.create({
      reviewType: 'expert',
      expert: expertId,
      session: sessionId,
      reviewer: rid,
      rating,
      comment
    });

    await review.populate('reviewer', 'fullName email profilePicture role');

    // Recalculate expert averages
    const allExpertReviews = await Review.find({
      reviewType: 'expert',
      expert: expertId
    });

    const avg =
      allExpertReviews.length === 0
        ? 0
        : allExpertReviews.reduce((sum, r) => sum + r.rating, 0) / allExpertReviews.length;

    await User.findByIdAndUpdate(expertId, {
      averageRating: avg,
      totalReviews: allExpertReviews.length
    });

    res.status(201).json({
      success: true,
      review
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this session'
      });
    }
    console.error('Create expert review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating expert review',
      error: error.message
    });
  }
};

// @desc    Get all expert reviews for a given session
// @route   GET /api/reviews/session/:sessionId/expert
// @access  Private
exports.getSessionExpertReviews = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const reviews = await Review.find({
      reviewType: 'expert',
      session: sessionId
    })
      .populate('reviewer', 'fullName email profilePicture role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Get session expert reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// @desc    Get all reviews for an expert (across sessions)
// @route   GET /api/reviews/expert/:expertId
// @access  Private
exports.getExpertReviews = async (req, res) => {
  try {
    const { expertId } = req.params;

    const reviews = await Review.find({
      reviewType: 'expert',
      expert: expertId
    })
      .populate('reviewer', 'fullName email profilePicture role')
      .populate('session', 'title moduleCode date')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Get expert reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};