/**
 * User Routes
 * Routes for user management
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, userController.getProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, userController.updateProfile);

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', protect, userController.getUserStats);

// @route   GET /api/users/activity
// @desc    Get user activity log
// @access  Private
router.get('/activity', protect, userController.getActivity);

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', protect, userController.updatePreferences);

// @route   PUT /api/users/responsible-gaming
// @desc    Update responsible gaming settings
// @access  Private
router.put('/responsible-gaming', protect, userController.updateResponsibleGaming);

// @route   POST /api/users/self-exclude
// @desc    Self-exclude from betting
// @access  Private
router.post('/self-exclude', protect, userController.selfExclude);

// @route   POST /api/users/upload-avatar
// @desc    Upload user avatar
// @access  Private
router.post('/upload-avatar', protect, userController.uploadAvatar);

module.exports = router;
