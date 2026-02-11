/**
 * Admin Routes
 * Routes for admin panel operations
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin, requireSuperAdmin, logAdminAction } = require('../middleware/admin.middleware');

// All routes require authentication and admin role
router.use(protect);
router.use(requireAdmin);

// User Management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', logAdminAction('update_user'), adminController.updateUser);
router.put('/users/:id/status', logAdminAction('change_user_status'), adminController.changeUserStatus);
router.delete('/users/:id', requireSuperAdmin, logAdminAction('delete_user'), adminController.deleteUser);

// KYC Management
router.get('/kyc/pending', adminController.getPendingKYC);
router.get('/kyc/:id', adminController.getKYCById);
// Pending affiliates
router.get('/affiliates/pending', adminController.getPendingAffiliates);
router.post('/kyc/:id/approve', logAdminAction('approve_kyc'), adminController.approveKYC);
router.post('/kyc/:id/reject', logAdminAction('reject_kyc'), adminController.rejectKYC);

// Bet Management
router.get('/bets', adminController.getAllBets);
router.get('/bets/:id', adminController.getBetById);
router.post('/bets/:id/void', logAdminAction('void_bet'), adminController.voidBet);

// Market Management
router.get('/markets', adminController.getAllMarkets);
router.post('/markets', logAdminAction('create_market'), adminController.createMarket);
router.put('/markets/:id', logAdminAction('update_market'), adminController.updateMarket);
router.post('/markets/:id/settle', logAdminAction('settle_market'), adminController.settleMarket);
router.post('/markets/:id/void', logAdminAction('void_market'), adminController.voidMarket);

// Transaction Management
router.get('/transactions', adminController.getAllTransactions);
router.get('/transactions/:id', adminController.getTransactionById);
router.put('/transactions/:id/status', logAdminAction('update_transaction_status'), adminController.updateTransactionStatus);

// Withdrawal Management
router.get('/withdrawals/pending', adminController.getPendingWithdrawals);
router.post('/withdrawals/:id/approve', logAdminAction('approve_withdrawal'), adminController.approveWithdrawal);
router.post('/withdrawals/:id/reject', logAdminAction('reject_withdrawal'), adminController.rejectWithdrawal);

// Promotion Management
router.get('/promotions', adminController.getPromotions);
router.post('/promotions', logAdminAction('create_promotion'), adminController.createPromotion);
router.put('/promotions/:id', logAdminAction('update_promotion'), adminController.updatePromotion);
router.delete('/promotions/:id', logAdminAction('delete_promotion'), adminController.deletePromotion);

// Reports
// Stats endpoints (kept for backward compatibility with frontend adminAPI)
router.get('/stats/overview', adminController.getOverviewStats);
router.get('/stats/revenue', adminController.getRevenueReport);
router.get('/stats/users', adminController.getUsersReport);
router.get('/stats/bets', adminController.getBetsReport);

// Legacy reports routes (also kept)
router.get('/reports/overview', adminController.getOverviewReport);
router.get('/reports/revenue', adminController.getRevenueReport);
router.get('/reports/users', adminController.getUsersReport);
router.get('/reports/bets', adminController.getBetsReport);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', requireSuperAdmin, logAdminAction('update_settings'), adminController.updateSettings);

// Logs
router.get('/logs/admin-actions', requireSuperAdmin, adminController.getAdminLogs);
router.get('/logs/system', requireSuperAdmin, adminController.getSystemLogs);

module.exports = router;
