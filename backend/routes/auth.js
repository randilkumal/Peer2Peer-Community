//router/authjs
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth'); // Import protect here

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], async (req, res) => {
  try {
    const { fullName, email, password, role, ...otherFields } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Determine status based on role
    let status = 'active'; // Students auto-approved
    if (role === 'expert' || role === 'lecturer') {
      status = 'pending'; // Needs admin approval
    }

    // Create user
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      role: role || 'student',
      status,
      ...otherFields
    });

    // Generate token
    const token = generateToken(user._id);

    // Response message based on status
    const message = status === 'active' 
      ? 'Registration successful! You can now log in.'
      : 'Your application has been submitted and is under review. You will receive an email once approved.';

    res.status(201).json({
      success: true,
      message,
      status,
      token: status === 'active' ? token : undefined,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        lecturerId: user.lecturerId,
        department: user.department,
        position: user.position,
        teachingModules: user.teachingModules,
        enrolledModules: user.enrolledModules
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check account status
    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval. You will be notified via email once approved.',
        status: 'pending'
      });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your account application was rejected. Please contact admin.',
        status: 'rejected'
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact admin.',
        status: 'inactive'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        yearLevel: user.yearLevel,
        semester: user.semester,
        specialization: user.specialization,
        profilePicture: user.profilePicture,
        lecturerId: user.lecturerId,
        department: user.department,
        position: user.position,
        teachingModules: user.teachingModules,
        enrolledModules: user.enrolledModules
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    console.log('=== GET /auth/me ===');
    console.log('User ID from token:', req.user.id);
    
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User found:', user.email);
    
    // Calculate profile completion manually if needed
    const profileCompletion = user.profileCompletion || 0;
    
    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        studentId: user.studentId,
        lecturerId: user.lecturerId,
        yearLevel: user.yearLevel,
        semester: user.semester,
        academicYear: user.academicYear,
        period: user.period,
        specialization: user.specialization,
        batch: user.batch,
        profilePicture: user.profilePicture,
        phone: user.phone,
        bio: user.bio,
        skills: user.skills,
        enrolledModules: user.enrolledModules,
        // Expert-specific
        gpa: user.gpa,
        masteredModules: user.masteredModules,
        expertiseModules: user.expertiseModules,
        tutoringExperience: user.tutoringExperience,
        transcript: user.transcript,
        averageRating: user.averageRating,
        totalReviews: user.totalReviews,
        sessionsConducted: user.sessionsConducted,
        // Lecturer-specific
        department: user.department,
        position: user.position,
        teachingModules: user.teachingModules,
        // Profile completion
        profileCompletion: profileCompletion
      }
    });
  } catch (error) {
    console.error('=== /auth/me ERROR ===');
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
      error: error.message
    });
  }
});

module.exports = router;