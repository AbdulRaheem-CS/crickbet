/**
 * Promotion Routes
 * Routes for promotions and bonuses
 */

const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotion.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

// @route   GET /api/promotions
// @desc    Get all active promotions
// @access  Public
router.get('/', optionalAuth, promotionController.getPromotions);

// @route   GET /api/promotions/:id
// @desc    Get promotion by ID
// @access  Public
router.get('/:id', optionalAuth, promotionController.getPromotionById);

// @route   POST /api/promotions/:id/claim
// @desc    Claim a promotion
// @access  Private
router.post('/:id/claim', protect, promotionController.claimPromotion);

// @route   POST /api/promotions/apply-code
// @desc    Apply promo code
// @access  Private
router.post('/apply-code', protect, promotionController.applyPromoCode);

// @route   GET /api/promotions/my-bonuses
// @desc    Get user's active bonuses
// @access  Private
router.get('/user/my-bonuses', protect, promotionController.getMyBonuses);

// @route   GET /api/promotions/bonus/:id/progress
// @desc    Get bonus wagering progress
// @access  Private
router.get('/bonus/:id/progress', protect, promotionController.getBonusProgress);

// @route   POST /api/promotions/bonus/:id/forfeit
// @desc    Forfeit bonus
// @access  Private
router.post('/bonus/:id/forfeit', protect, promotionController.forfeitBonus);

module.exports = router;
