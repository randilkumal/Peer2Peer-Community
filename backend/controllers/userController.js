const User = require('../models/User');
const { sendApprovalEmail, sendRejectionEmail } = require('../utils/email');

// @desc    Get all users with filters
// @route   GET /api/users
// @access  Admin
exports.getUsers = async (req, res) => {
  try {
    const { role, status, yearLevel, specialization, search } = req.query;

    // Build filter object
    let filter = {};

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (yearLevel) filter.yearLevel = parseInt(yearLevel);
    if (specialization) filter.specialization = specialization;

    // Search by name or email
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const requesterId = req.user._id?.toString() || req.user.id?.toString();
    if (req.user.role !== 'admin' && requesterId !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    // Fields that can be updated
    const allowedUpdates = [
      'fullName',
      'email',
      'phone',
      'bio',
      'yearLevel',
      'semester',
      'specialization',
      'department',
      'position',
      'enrolledModules',
      'teachingModules'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    const userOut = await User.findById(user._id).select('-password');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: userOut
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// @desc    Update user role
// @route   PATCH /api/users/:id/role
// @access  Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['student', 'expert', 'lecturer', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message
    });
  }
};

// @desc    Update user status (approve/reject expert)
// @route   PATCH /api/users/:id/status
// @access  Admin
exports.updateUserStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['active', 'pending', 'rejected', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const previousStatus = user.status;
    user.status = status;
    
    if (status === 'rejected' && rejectionReason) {
      user.rejectionReason = rejectionReason;
    }

    await user.save();

    // Send email notification only when status actually changes
    try {
      if (previousStatus !== status) {
        if (status === 'active') {
          // Approval email: tell them they can now log in
          await sendApprovalEmail(user.email, user.fullName, user.role);
        } else if (status === 'rejected') {
          await sendRejectionEmail(user.email, user.fullName, user.role, rejectionReason);
        }
      }
    } catch (emailError) {
      // Log but don't fail the API if email sending breaks
      console.error('Error sending status email:', emailError.message);
    }

    res.status(200).json({
      success: true,
      message: `User ${status} successfully`,
      user
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
};