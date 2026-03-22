const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  updateUserStatus
} = require('../controllers/userController');

// @route   GET /api/users
// @desc    Get all users with optional filters
// @access  Admin
router.get('/', protect, authorize('admin'), getUsers);

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Admin
router.get('/:id', protect, authorize('admin'), getUserById);

// @route   PUT /api/users/:id
// @desc    Update user (Admin or Self)
// @access  Private
router.put('/:id', protect, updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Admin
router.delete('/:id', protect, authorize('admin'), deleteUser);

// @route   PATCH /api/users/:id/role
// @desc    Update user role
// @access  Admin
router.patch('/:id/role', protect, authorize('admin'), updateUserRole);

// @route   PATCH /api/users/:id/status
// @desc    Update user status (approve/reject)
// @access  Admin
router.patch('/:id/status', protect, authorize('admin'), updateUserStatus);

module.exports = router;