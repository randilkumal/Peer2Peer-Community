const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Session = require('../models/Session');
const Review = require('../models/Review');

// All routes below require authentication
router.use(protect);

/**
 * GET /api/sessions
 * Query params:
 *  - status: requested | pending | confirmed | completed | cancelled
 *  - participant: userId (filter sessions a user is participating in)
 */
router.get('/', async (req, res) => {
  try {
    const { status, participant } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    // Filter by participant or expert
    if (participant) {
      query.$or = [
        { participants: participant },
        { expert: participant }
      ];
    }

    const sessions = await Session.find(query)
      .populate('participants', 'fullName email')
      .populate('expert', 'fullName email averageRating totalReviews gpa')
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();

    const uid = req.user._id || req.user.id;
    const sessionIds = sessions.map(s => s._id);
    const userReviews = await Review.find({
      reviewer: uid,
      session: { $in: sessionIds }
    }).lean();
    
    const reviewedSessionIds = new Set(userReviews.map(r => r.session.toString()));

    // Shape data for frontend (student/admin/expert friendly)
    const shaped = sessions.map(s => ({
      _id: s._id,
      title: s.title,
      moduleCode: s.moduleCode,
      description: s.description,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      isOnline: s.isOnline,
      venue: s.venue,
      meetingLink: s.meetingLink,
      maxParticipants: s.maxParticipants,
      participants: s.participants,
      requiredStudents: s.requiredStudents,
      requiredExperts: s.requiredExperts,
      status: s.status,
      expert: s.expert,
      pendingRequests: s.pendingRequests,
      createdBy: s.createdBy,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      userRated: reviewedSessionIds.has(s._id.toString())
    }));

    res.json({ success: true, sessions: shaped });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sessions',
      error: error.message
    });
  }
});

/**
 * GET /api/sessions/my-requests
 * Return all sessions where current user has a pending/processed request
 */
router.get('/my-requests', async (req, res) => {
  try {
    const userId = req.user._id;

    const sessions = await Session.find({
      'pendingRequests.user': userId
    })
      .populate('expert', 'fullName email averageRating totalReviews')
      .sort({ createdAt: -1 });

    res.json({ success: true, sessions });
  } catch (error) {
    console.error('Error fetching my session requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your session requests',
      error: error.message
    });
  }
});

/**
 * ADMIN: create a new session announcement
 * POST /api/sessions
 */
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const {
      title,
      moduleCode,
      description,
      requiredStudents,
      requiredExperts,
      maxParticipants
    } = req.body;

    if (!title || !moduleCode || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title, module code and description are required'
      });
    }

    const session = await Session.create({
      title,
      moduleCode,
      description,
      requiredStudents: requiredStudents || 25,
      requiredExperts: requiredExperts || 1,
      maxParticipants: maxParticipants || requiredStudents || 25,
      status: 'requested',
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, session });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating session',
      error: error.message
    });
  }
});

/**
 * ADMIN: update session details (date/time/venue/status, etc.)
 * PUT /api/sessions/:id
 */
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const updates = req.body || {};

    const session = await Session.findById(req.params.id)
      .populate('participants', 'fullName email')
      .populate('expert', 'fullName email')
      .populate('createdBy', 'fullName email');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if trying to edit Schedule fields without proper requiredStudents/requiredExperts
    const scheduleKeys = ['date', 'startTime', 'endTime', 'venue', 'meetingLink', 'isOnline'];
    const scheduleUpdateAttempted = scheduleKeys.some((k) => Object.prototype.hasOwnProperty.call(updates, k));
    
    // Get the requiredStudents and requiredExperts values (new or existing)
    const newRequiredStudents = updates.requiredStudents !== undefined ? updates.requiredStudents : session.requiredStudents;
    const newRequiredExperts = updates.requiredExperts !== undefined ? updates.requiredExperts : session.requiredExperts;
    
    // If trying to edit Schedule fields, check if both requiredStudents and requiredExperts are properly filled
    if (scheduleUpdateAttempted) {
      const studentsInvalid = !newRequiredStudents || newRequiredStudents <= 0;
      const expertsInvalid = !newRequiredExperts || newRequiredExperts <= 0;
      if (studentsInvalid || expertsInvalid) {
        return res.status(400).json({
          success: false,
          message: 'To edit this post with this data, you need to complete the minimum student and expert count required to conduct this session.',
          errorCode: 'SCHEDULE_EDIT_REQUIRES_STUDENTS_EXPERTS',
          requiresStudents: studentsInvalid,
          requiresExperts: expertsInvalid
        });
      }

      const joinedStudents = Array.isArray(session.participants) ? session.participants.length : 0;
      if (joinedStudents < Number(newRequiredStudents)) {
        return res.status(400).json({
          success: false,
          message: `Schedule can be edited only after ${newRequiredStudents} students have joined this session. Current joined students: ${joinedStudents}.`,
          errorCode: 'SCHEDULE_EDIT_REQUIRES_STUDENT_JOINS',
          requiredStudents: Number(newRequiredStudents),
          joinedStudents
        });
      }
    }

    // Apply updates (only known fields)
    const updatable = [
      'title',
      'moduleCode',
      'description',
      'requiredStudents',
      'requiredExperts',
      'maxParticipants',
      'date',
      'startTime',
      'endTime',
      'isOnline',
      'venue',
      'meetingLink',
      'additionalNotes',
      'status'
    ];

    updatable.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(updates, k)) {
        session[k] = updates[k];
      }
    });

    const hasFilledScheduleData = Boolean(
      session.date ||
      session.startTime ||
      session.endTime ||
      (typeof session.venue === 'string' && session.venue.trim()) ||
      (typeof session.meetingLink === 'string' && session.meetingLink.trim())
    );

    // If admin adds schedule details after minimum counts are complete, move requested -> pending automatically
    if (session.status === 'requested' && hasFilledScheduleData && session.requiredStudents > 0 && session.requiredExperts > 0) {
      session.status = 'pending';
    }

    await session.save();

    const refreshed = await Session.findById(session._id)
      .populate('participants', 'fullName email')
      .populate('expert', 'fullName email')
      .populate('createdBy', 'fullName email');

    res.json({ success: true, session: refreshed });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating session',
      error: error.message
    });
  }
});

/**
 * ADMIN: cancel a session announcement/session
 * PATCH /api/sessions/:id/cancel
 */
router.patch('/:id/cancel', authorize('admin'), async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    session.status = 'cancelled';
    await session.save();
    res.json({ success: true, session });
  } catch (error) {
    console.error('Error cancelling session:', error);
    res.status(500).json({ success: false, message: 'Error cancelling session', error: error.message });
  }
});

/**
 * ADMIN: mark a session as completed
 * PATCH /api/sessions/:id/complete
 */
router.patch('/:id/complete', authorize('admin'), async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    session.status = 'completed';
    session.completedAt = new Date();
    await session.save();
    res.json({ success: true, session });
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({ success: false, message: 'Error completing session', error: error.message });
  }
});

/**
 * GET /api/sessions/:id
 * Session detail for student/admin/expert
 */
router.get('/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('participants', 'fullName email')
      .populate('expert', 'fullName email averageRating totalReviews gpa bio expertiseModules sessionsConducted')
      .populate('createdBy', 'fullName email')
      .populate('pendingRequests.user', 'fullName email role');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const uid = req.user._id || req.user.id;
    const alreadyReviewed = await Review.exists({
      reviewType: 'expert',
      session: session._id,
      reviewer: uid
    });

    const sessionOut = session.toObject();
    sessionOut.userRated = !!alreadyReviewed;

    res.json({ success: true, session: sessionOut });
  } catch (error) {
    console.error('Error fetching session detail:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching session detail',
      error: error.message
    });
  }
});

/**
 * POST /api/sessions/:id/join
 * Student joins a session instantly (no admin approval)
 * Body: { role?: 'student' | 'expert' } (expert kept for compatibility)
 */
router.post('/:id/join', async (req, res) => {
  try {
    const { role = 'student' } = req.body;
    const userId = req.user._id;

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'This session has been cancelled' });
    }
    if (session.status === 'completed') {
      return res.status(400).json({ success: false, message: 'This session is already completed' });
    }

    // Prevent join if already participant
    const alreadyParticipant = session.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (alreadyParticipant) {
      return res.status(400).json({
        success: false,
        message: 'You are already joined to this session'
      });
    }

    const max = session.maxParticipants || session.requiredStudents || 25;
    const current = session.participants.length || 0;
    if (current >= max) {
      return res.status(400).json({ success: false, message: 'No spots left for this session' });
    }

    if (role === 'expert') {
      // Create a pending request for the expert to volunteer
      const alreadyRequested = session.pendingRequests.some(r => r.user.toString() === userId.toString());
      if (alreadyRequested) {
         return res.status(400).json({ success: false, message: 'You have already volunteered for this session' });
      }
      if (session.expert && session.expert.toString() === userId.toString()) {
         return res.status(400).json({ success: false, message: 'You are already the assigned expert' });
      }
      session.pendingRequests.push({
         user: userId,
         role: 'expert',
         reason: req.body.reason || '',
         status: 'pending'
      });
    } else {
      session.participants.push(userId);
    }

    await session.save();

    res.json({
      success: true,
      message: 'Joined session successfully'
    });
  } catch (error) {
    console.error('Error joining session:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining session',
      error: error.message
    });
  }
});

/**
 * ADMIN: Approve or reject a join request
 * POST /api/sessions/:id/requests/:requestId/approve | /reject
 */
router.post('/:id/requests/:requestId/approve', authorize('admin'), async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const reqItem = session.pendingRequests.id(req.params.requestId);
    if (!reqItem || reqItem.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Request not found or already processed' });
    }

    reqItem.status = 'approved';

    if (reqItem.role === 'student') {
      const userId = reqItem.user._id || reqItem.user;
      if (!session.participants.some(p => p.toString() === userId.toString())) {
        session.participants.push(userId);
      }
    } else if (reqItem.role === 'expert') {
      session.expert = reqItem.user._id || reqItem.user;
    }

    await session.save();
    const updated = await Session.findById(session._id)
      .populate('participants', 'fullName email')
      .populate('expert', 'fullName email')
      .populate('pendingRequests.user', 'fullName email role');

    res.json({ success: true, session: updated });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ success: false, message: 'Error approving request', error: error.message });
  }
});

router.post('/:id/requests/:requestId/reject', authorize('admin'), async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const reqItem = session.pendingRequests.id(req.params.requestId);
    if (!reqItem || reqItem.status !== 'pending') {
      return res.status(404).json({ success: false, message: 'Request not found or already processed' });
    }

    reqItem.status = 'rejected';
    await session.save();
    const updated = await Session.findById(session._id)
      .populate('participants', 'fullName email')
      .populate('expert', 'fullName email')
      .populate('pendingRequests.user', 'fullName email role');

    res.json({ success: true, session: updated });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ success: false, message: 'Error rejecting request', error: error.message });
  }
});

/**
 * POST /api/sessions/:id/withdraw
 * Withdraw a previously made request or leave a session
 */
router.post('/:id/withdraw', async (req, res) => {
  try {
    const userId = req.user._id;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Mark pending requests as withdrawn
    session.pendingRequests = session.pendingRequests.map((r) => {
      if (r.user.toString() === userId.toString() && r.status === 'pending') {
        r.status = 'withdrawn';
      }
      return r;
    });

    // Remove from participants if already joined
    session.participants = session.participants.filter(
      (p) => p.toString() !== userId.toString()
    );

    await session.save();

    res.json({
      success: true,
      message: 'Request/participation withdrawn successfully'
    });
  } catch (error) {
    console.error('Error withdrawing from session:', error);
    res.status(500).json({
      success: false,
      message: 'Error withdrawing from session',
      error: error.message
    });
  }
});

module.exports = router;
