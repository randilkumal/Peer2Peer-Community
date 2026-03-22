const SessionRequest = require('../models/SessionRequest');
const User = require('../models/User');

// @desc    Create a new session request
// @route   POST /api/session-requests
// @access  Private (Student/Expert)
exports.createSessionRequest = async (req, res) => {
  try {
    console.log('=== CREATE SESSION REQUEST ===');
    console.log('User:', req.user.id);
    console.log('Body:', req.body);

    const { topic, moduleCode, reason } = req.body;

    // Validation
    if (!topic || !topic.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Topic is required' 
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reason is required' 
      });
    }

    // Create session request
    const sessionRequest = await SessionRequest.create({
      user: req.user.id,
      topic: topic.trim(),
      moduleCode: moduleCode ? moduleCode.trim() : '',
      reason: reason.trim(),
      status: 'pending',
      messageStatus: 'delivered'
    });

    // Populate user info
    await sessionRequest.populate('user', 'fullName email role studentId');

    console.log('✅ Session request created:', sessionRequest._id);

    res.status(201).json({
      success: true,
      message: 'Session request submitted successfully',
      sessionRequest
    });
  } catch (error) {
    console.error('❌ Create session request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit session request',
      error: error.message
    });
  }
};

// @desc    Get all session requests (Admin only)
// @route   GET /api/session-requests
// @access  Private (Admin)
exports.getAllSessionRequests = async (req, res) => {
  try {
    console.log('=== GET ALL SESSION REQUESTS ===');
    console.log('Admin:', req.user.id);

    const { status } = req.query;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }

    const sessionRequests = await SessionRequest.find(query)
      .populate('user', 'fullName email role studentId yearLevel specialization')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${sessionRequests.length} session requests`);

    res.json({
      success: true,
      sessionRequests,
      count: sessionRequests.length
    });
  } catch (error) {
    console.error('❌ Get session requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load session requests',
      error: error.message
    });
  }
};

// @desc    Get user's own session requests
// @route   GET /api/session-requests/my-requests
// @access  Private
exports.getMySessionRequests = async (req, res) => {
  try {
    console.log('=== GET MY SESSION REQUESTS ===');
    console.log('User:', req.user.id);

    const sessionRequests = await SessionRequest.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${sessionRequests.length} requests for user`);

    res.json({
      success: true,
      sessionRequests
    });
  } catch (error) {
    console.error('❌ Get my requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load your requests',
      error: error.message
    });
  }
};

// @desc    Mark session request message as seen (Admin only - for message delivery status)
// @route   PATCH /api/session-requests/:id/message-status
// @access  Private (Admin)
exports.markRequestMessageSeen = async (req, res) => {
  try {
    console.log('=== MARK SESSION REQUEST MESSAGE SEEN ===');
    console.log('Admin:', req.user.id);
    console.log('Request ID:', req.params.id);

    const sessionRequest = await SessionRequest.findById(req.params.id);

    if (!sessionRequest) {
      return res.status(404).json({
        success: false,
        message: 'Session request not found'
      });
    }

    // Only update messageStatus, do not touch approval status here
    sessionRequest.messageStatus = 'seen';
    await sessionRequest.save();

    await sessionRequest.populate('user', 'fullName email role studentId');

    res.json({
      success: true,
      message: 'Session request message marked as seen',
      sessionRequest
    });
  } catch (error) {
    console.error('❌ Mark message seen error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message status',
      error: error.message
    });
  }
};

// @desc    Update session request status (Admin only)
// @route   PATCH /api/session-requests/:id/status
// @access  Private (Admin)
exports.updateRequestStatus = async (req, res) => {
  try {
    console.log('=== UPDATE REQUEST STATUS ===');
    console.log('Request ID:', req.params.id);
    console.log('New status:', req.body.status);

    const { status, adminNote } = req.body;

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, approved, or rejected'
      });
    }

    const sessionRequest = await SessionRequest.findById(req.params.id);

    if (!sessionRequest) {
      return res.status(404).json({
        success: false,
        message: 'Session request not found'
      });
    }

    // Update status
    sessionRequest.status = status;
    if (adminNote) {
      sessionRequest.adminNote = adminNote;
    }
    sessionRequest.reviewedAt = new Date();
    sessionRequest.reviewedBy = req.user.id;

    await sessionRequest.save();
    await sessionRequest.populate('user', 'fullName email');

    console.log('✅ Status updated to:', status);

    res.json({
      success: true,
      message: `Session request ${status}`,
      sessionRequest
    });
  } catch (error) {
    console.error('❌ Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
};

// @desc    Delete session request
// @route   DELETE /api/session-requests/:id
// @access  Private (Owner or Admin)
exports.deleteSessionRequest = async (req, res) => {
  try {
    console.log('=== DELETE SESSION REQUEST ===');
    console.log('Request ID:', req.params.id);

    const sessionRequest = await SessionRequest.findById(req.params.id);

    if (!sessionRequest) {
      return res.status(404).json({
        success: false,
        message: 'Session request not found'
      });
    }

    // Check permission (owner or admin)
    if (sessionRequest.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this request'
      });
    }

    await sessionRequest.deleteOne();

    console.log('✅ Session request deleted');

    res.json({
      success: true,
      message: 'Session request deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete request',
      error: error.message
    });
  }
};