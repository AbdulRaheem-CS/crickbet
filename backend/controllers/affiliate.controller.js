/**
 * Affiliate Controller
 * Handles all affiliate program operations
 */

const { asyncHandler } = require("../middleware/error.middleware");
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Bet = require('../models/Bet');
const CommissionDesignation = require('../models/CommissionDesignation');
const AffiliateLink = require('../models/AffiliateLink');

module.exports = {
  applyForAffiliate: asyncHandler(async (req, res) => {
    res.status(201).json({ success: true, message: 'Application submitted' });
  }),
  
  /**
   * @route   GET /api/affiliate/dashboard
   * @desc    Get affiliate dashboard statistics
   * @access  Private (Affiliate)
   */
  getDashboard: asyncHandler(async (req, res) => {
    const affiliateId = req.user._id;

    // Get current period (this month)
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get referred users
    const referredUsers = await User.find({ referredBy: affiliateId }).select('_id createdAt').lean();
    const referredUserIds = referredUsers.map(u => u._id);

    // Commission stats
    const [thisMonthCommission, lastMonthCommission] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            userId: affiliateId,
            type: 'commission',
            status: 'completed',
            createdAt: { $gte: thisMonthStart }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: affiliateId,
            type: 'commission',
            status: 'completed',
            createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ])
    ]);

    // Active players (users who placed bets this month)
    const [activePlayersThis, activePlayersLast] = await Promise.all([
      Bet.distinct('userId', {
        userId: { $in: referredUserIds },
        createdAt: { $gte: thisMonthStart }
      }),
      Bet.distinct('userId', {
        userId: { $in: referredUserIds },
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
      })
    ]);

    // Registered Users by period
    const registeredUsers = await User.aggregate([
      {
        $match: {
          referredBy: affiliateId
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ]);

    // First Deposit
    const firstDeposits = await Transaction.aggregate([
      {
        $match: {
          userId: { $in: referredUserIds },
          type: 'deposit',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$userId',
          firstDeposit: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$firstDeposit' }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ]);

    // Deposits
    const deposits = await Transaction.aggregate([
      {
        $match: {
          userId: { $in: referredUserIds },
          type: 'deposit',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ]);

    // Withdrawals
    const withdrawals = await Transaction.aggregate([
      {
        $match: {
          userId: { $in: referredUserIds },
          type: 'withdrawal',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ]);

    // Bonus
    const bonuses = await Transaction.aggregate([
      {
        $match: {
          userId: { $in: referredUserIds },
          type: 'bonus',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ]);

    // Recycle Amount (refunds/returns)
    const recycleAmount = await Transaction.aggregate([
      {
        $match: {
          userId: { $in: referredUserIds },
          type: 'refund',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ]);

    // Cancel Fee
    const cancelFees = await Transaction.aggregate([
      {
        $match: {
          userId: { $in: referredUserIds },
          type: 'fee',
          subType: 'cancel_fee',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ]);

    // VIP Cash Bonus
    const vipCashBonus = await Transaction.aggregate([
      {
        $match: {
          userId: { $in: referredUserIds },
          type: 'bonus',
          subType: 'vip_cash',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ]);

    // Referral Commission
    const referralCommissions = await Transaction.aggregate([
      {
        $match: {
          userId: affiliateId,
          type: 'commission',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ]);

    // Turnover
    const turnover = await Bet.aggregate([
      {
        $match: {
          userId: { $in: referredUserIds },
          status: { $in: ['settled', 'won', 'lost'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          amount: { $sum: '$stake' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ]);

    // Affiliate Profit & Loss
    const profitLoss = await Transaction.aggregate([
      {
        $match: {
          userId: { $in: referredUserIds },
          type: { $in: ['deposit', 'withdrawal', 'bet_settlement'] },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          deposits: {
            $sum: {
              $cond: [{ $eq: ['$type', 'deposit'] }, '$amount', 0]
            }
          },
          withdrawals: {
            $sum: {
              $cond: [{ $eq: ['$type', 'withdrawal'] }, '$amount', 0]
            }
          },
          settlements: {
            $sum: {
              $cond: [{ $eq: ['$type', 'bet_settlement'] }, '$profitLoss', 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          count: { $literal: 1 },
          amount: {
            $subtract: [
              { $add: ['$deposits', '$settlements'] },
              '$withdrawals'
            ]
          }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        commission: {
          thisMonth: thisMonthCommission[0]?.total || 0,
          lastMonth: lastMonthCommission[0]?.total || 0
        },
        activePlayers: {
          thisMonth: activePlayersThis.length,
          lastMonth: activePlayersLast.length
        },
        registeredUsers,
        firstDeposits,
        deposits,
        withdrawals,
        bonuses,
        recycleAmount,
        cancelFees,
        vipCashBonus,
        referralCommissions,
        turnover,
        profitLoss
      }
    });
  }),
  
  /**
   * @route   GET /api/affiliate/profile
   * @desc    Get affiliate profile with potential earnings
   * @access  Private (Affiliate)
   */
  getProfile: asyncHandler(async (req, res) => {
    const affiliateId = req.user._id;

    // Get user profile
    const user = await User.findById(affiliateId).select(
      'username firstName lastName email phoneNumber dateOfBirth referralCode status createdAt lastLogin'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get current period (this month)
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get referred users
    const referredUsers = await User.find({ referredBy: affiliateId }).select('_id').lean();
    const referredUserIds = referredUsers.map(u => u._id);

    // Get last withdrawal time
    const lastWithdrawal = await Transaction.findOne({
      userId: affiliateId,
      type: 'withdrawal',
      status: 'completed'
    }).sort({ createdAt: -1 }).select('createdAt');

    // Calculate potential earnings (this period)
    const [
      totalProfitLoss,
      totalDeduction,
      totalRevenueTurnover,
      totalBonus,
      totalRecycleAmount,
      totalCancelFee,
      totalVipCashBonus,
      totalReferralCommission,
      totalRevenueAdjustment,
      totalPaymentFee
    ] = await Promise.all([
      // Total Profit & Loss
      Transaction.aggregate([
        {
          $match: {
            userId: { $in: referredUserIds },
            createdAt: { $gte: thisMonthStart },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            deposits: {
              $sum: {
                $cond: [{ $eq: ['$type', 'deposit'] }, '$amount', 0]
              }
            },
            withdrawals: {
              $sum: {
                $cond: [{ $eq: ['$type', 'withdrawal'] }, '$amount', 0]
              }
            },
            settlements: {
              $sum: {
                $cond: [{ $eq: ['$type', 'bet_settlement'] }, { $ifNull: ['$profitLoss', 0] }, 0]
              }
            }
          }
        },
        {
          $project: {
            total: {
              $subtract: [
                { $add: ['$deposits', '$settlements'] },
                '$withdrawals'
              ]
            }
          }
        }
      ]),
      // Total Deduction
      Transaction.aggregate([
        {
          $match: {
            userId: { $in: referredUserIds },
            type: 'deduction',
            createdAt: { $gte: thisMonthStart },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      // Total Revenue From Turnover
      Bet.aggregate([
        {
          $match: {
            userId: { $in: referredUserIds },
            status: { $in: ['settled', 'won', 'lost'] },
            createdAt: { $gte: thisMonthStart }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$stake' }
          }
        }
      ]),
      // Total Bonus
      Transaction.aggregate([
        {
          $match: {
            userId: { $in: referredUserIds },
            type: 'bonus',
            createdAt: { $gte: thisMonthStart },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      // Total Recycle Amount
      Transaction.aggregate([
        {
          $match: {
            userId: { $in: referredUserIds },
            type: 'refund',
            createdAt: { $gte: thisMonthStart },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      // Total Cancel Fee
      Transaction.aggregate([
        {
          $match: {
            userId: { $in: referredUserIds },
            type: 'fee',
            subType: 'cancel_fee',
            createdAt: { $gte: thisMonthStart },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      // Total VIP Cash Bonus
      Transaction.aggregate([
        {
          $match: {
            userId: { $in: referredUserIds },
            type: 'bonus',
            subType: 'vip_cash',
            createdAt: { $gte: thisMonthStart },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      // Total Referral Commission
      Transaction.aggregate([
        {
          $match: {
            userId: affiliateId,
            type: 'commission',
            createdAt: { $gte: thisMonthStart },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      // Total Revenue Adjustment
      Transaction.aggregate([
        {
          $match: {
            userId: { $in: referredUserIds },
            type: 'adjustment',
            createdAt: { $gte: thisMonthStart },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      // Total Payment Fee
      Transaction.aggregate([
        {
          $match: {
            userId: { $in: referredUserIds },
            type: 'fee',
            subType: 'payment_fee',
            createdAt: { $gte: thisMonthStart },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ])
    ]);

    // Calculate negative carry forward and net profit
    const profitLossValue = totalProfitLoss[0]?.total || 0;
    const negativeCarryForward = profitLossValue < 0 ? Math.abs(profitLossValue) : 0;
    const totalNetProfit = Math.max(0, profitLossValue);

    // Calculate commission percentage (default to 0)
    const commissionPercentage = 0;

    // Calculate earnings
    const earnings = totalNetProfit * (commissionPercentage / 100);

    // Get commission balances
    const [pending, available, processingWithdrawal] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            userId: affiliateId,
            type: 'commission',
            status: 'pending'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: affiliateId,
            type: 'commission',
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: affiliateId,
            type: 'withdrawal',
            status: 'processing'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        profile: {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          dateOfBirth: user.dateOfBirth,
          referralCode: user.referralCode,
          accountStatus: user.status,
          approvedDate: user.createdAt,
          lastLoginTime: user.lastLogin,
          lastWithdrawalTime: lastWithdrawal?.createdAt || null
        },
        potential: {
          totalProfitLoss: profitLossValue,
          totalDeduction: totalDeduction[0]?.total || 0,
          totalRevenueTurnover: totalRevenueTurnover[0]?.total || 0,
          totalBonus: totalBonus[0]?.total || 0,
          totalRecycleAmount: totalRecycleAmount[0]?.total || 0,
          totalReferralCommission: totalReferralCommission[0]?.total || 0,
          totalRevenueAdjustment: totalRevenueAdjustment[0]?.total || 0,
          totalCancelFee: totalCancelFee[0]?.total || 0,
          totalVipCashBonus: totalVipCashBonus[0]?.total || 0,
          totalPaymentFee: totalPaymentFee[0]?.total || 0,
          negativeCarryForward: negativeCarryForward,
          totalNetProfit: totalNetProfit,
          commissionPercentage: commissionPercentage,
          earnings: earnings
        },
        commission: {
          pending: pending[0]?.total || 0,
          available: available[0]?.total || 0,
          processingWithdrawal: processingWithdrawal[0]?.total || 0
        }
      }
    });
  }),
  
  getStats: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: {} });
  }),
  getEarnings: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getReferredUsers: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  createTrackingLink: asyncHandler(async (req, res) => {
    res.status(201).json({ success: true, data: { link: '' } });
  }),
  getTrackingLinks: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  getMarketingMaterials: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  requestPayout: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: 'Payout requested' });
  }),
  getPayouts: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, data: [] });
  }),
  updatePaymentInfo: asyncHandler(async (req, res) => {
    res.status(200).json({ success: true, message: 'Payment info updated' });
  }),

  /**
   * @route   GET /api/affiliate/bank-accounts
   * @desc    Get all bank accounts for affiliate
   * @access  Private (Affiliate)
   */
  getBankAccounts: asyncHandler(async (req, res) => {
    const affiliateId = req.user._id;

    // Find user and get bank accounts
    const user = await User.findById(affiliateId).select('bankAccounts');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user.bankAccounts || []
    });
  }),

  /**
   * @route   POST /api/affiliate/bank-accounts
   * @desc    Add new bank account
   * @access  Private (Affiliate)
   */
  addBankAccount: asyncHandler(async (req, res) => {
    const affiliateId = req.user._id;
    const { accountHolderName, bankName, accountNumber, ifscCode, branchName, accountType, isDefault } = req.body;

    // Validate required fields
    if (!accountHolderName || !bankName || !accountNumber || !ifscCode || !branchName) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    const user = await User.findById(affiliateId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Initialize bankAccounts array if it doesn't exist
    if (!user.bankAccounts) {
      user.bankAccounts = [];
    }

    // If this is set as default or it's the first account, unset other defaults
    if (isDefault || user.bankAccounts.length === 0) {
      user.bankAccounts.forEach(account => {
        account.isDefault = false;
      });
    }

    // Add new bank account
    const newBankAccount = {
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode: ifscCode.toUpperCase(),
      branchName,
      accountType: accountType || 'savings',
      isDefault: isDefault || user.bankAccounts.length === 0,
      createdAt: new Date()
    };

    user.bankAccounts.push(newBankAccount);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Bank account added successfully',
      data: user.bankAccounts
    });
  }),

  /**
   * @route   DELETE /api/affiliate/bank-accounts/:id
   * @desc    Delete bank account
   * @access  Private (Affiliate)
   */
  deleteBankAccount: asyncHandler(async (req, res) => {
    const affiliateId = req.user._id;
    const { id } = req.params;

    const user = await User.findById(affiliateId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.bankAccounts || user.bankAccounts.length === 0) {
      return res.status(404).json({ success: false, message: 'No bank accounts found' });
    }

    // Find the account to delete
    const accountIndex = user.bankAccounts.findIndex(
      account => account._id.toString() === id
    );

    if (accountIndex === -1) {
      return res.status(404).json({ success: false, message: 'Bank account not found' });
    }

    const wasDefault = user.bankAccounts[accountIndex].isDefault;

    // Remove the account
    user.bankAccounts.splice(accountIndex, 1);

    // If the deleted account was default and there are other accounts, set the first one as default
    if (wasDefault && user.bankAccounts.length > 0) {
      user.bankAccounts[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Bank account deleted successfully',
      data: user.bankAccounts
    });
  }),

  /**
   * @route   PUT /api/affiliate/bank-accounts/:id/set-default
   * @desc    Set bank account as default
   * @access  Private (Affiliate)
   */
  setDefaultBankAccount: asyncHandler(async (req, res) => {
    const affiliateId = req.user._id;
    const { id } = req.params;

    const user = await User.findById(affiliateId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.bankAccounts || user.bankAccounts.length === 0) {
      return res.status(404).json({ success: false, message: 'No bank accounts found' });
    }

    // Find the account to set as default
    const account = user.bankAccounts.find(
      account => account._id.toString() === id
    );

    if (!account) {
      return res.status(404).json({ success: false, message: 'Bank account not found' });
    }

    // Unset all defaults
    user.bankAccounts.forEach(acc => {
      acc.isDefault = false;
    });

    // Set the selected account as default
    account.isDefault = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Default bank account updated successfully',
      data: user.bankAccounts
    });
  }),

  /**
   * @route   GET /api/affiliate/hierarchy
   * @desc    Get affiliate hierarchy (upline and downline)
   * @access  Private (Affiliate)
   */
  getHierarchy: asyncHandler(async (req, res) => {
    const affiliateId = req.user._id;

    // Get current user
    const currentUser = await User.findById(affiliateId).select('referredBy');
    
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get upline (the person who referred this user)
    let upline = null;
    if (currentUser.referredBy) {
      upline = await User.findById(currentUser.referredBy)
        .select('username email phoneNumber createdAt status')
        .lean();
    }

    // Get downline (users referred by this user)
    const downlineUsers = await User.find({ referredBy: affiliateId })
      .select('username email phoneNumber createdAt status')
      .sort({ createdAt: -1 })
      .lean();

    // Get referral IDs for stats
    const referralIds = downlineUsers.map(u => u._id);

    // Calculate stats for each referral
    const downlineWithStats = await Promise.all(
      downlineUsers.map(async (referralUser) => {
        const [deposits, withdrawals, bets] = await Promise.all([
          Transaction.aggregate([
            {
              $match: {
                userId: referralUser._id,
                type: 'deposit',
                status: 'completed'
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$amount' }
              }
            }
          ]),
          Transaction.aggregate([
            {
              $match: {
                userId: referralUser._id,
                type: 'withdrawal',
                status: 'completed'
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$amount' }
              }
            }
          ]),
          Bet.countDocuments({
            userId: referralUser._id,
            status: { $in: ['settled', 'won', 'lost'] }
          })
        ]);

        return {
          ...referralUser,
          totalDeposits: deposits[0]?.total || 0,
          totalWithdrawals: withdrawals[0]?.total || 0,
          totalBets: bets
        };
      })
    );

    // Calculate overall stats
    const [totalEarnings, activeBettors] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            userId: affiliateId,
            type: 'commission',
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      Bet.distinct('userId', {
        userId: { $in: referralIds },
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        upline: upline,
        downline: downlineWithStats,
        stats: {
          totalReferrals: downlineUsers.length,
          activeReferrals: activeBettors.length,
          totalEarnings: totalEarnings[0]?.total || 0
        }
      }
    });
  }),

  /**
   * @route   GET /api/affiliate/kyc
   * @desc    Get affiliate KYC status and documents
   * @access  Private (Affiliate)
   */
  getKYC: asyncHandler(async (req, res) => {
    const affiliateId = req.user._id;

    const user = await User.findById(affiliateId).select('kyc').lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        kyc: user.kyc || {
          status: 'pending',
          identity: {
            documentType: null,
            documentNumber: null,
            expiryDate: null,
            frontImage: null,
            backImage: null,
            selfieImage: null,
            verified: false
          },
          address: {
            documentType: null,
            documentNumber: null,
            expiryDate: null,
            frontImage: null,
            backImage: null,
            verified: false
          }
        }
      }
    });
  }),

  /**
   * @route   POST /api/affiliate/kyc/identity
   * @desc    Submit identity KYC documents
   * @access  Private (Affiliate)
   */
  submitIdentityKYC: asyncHandler(async (req, res) => {
    const affiliateId = req.user._id;
    const { documentType, documentNumber, expiryDate, frontImage, backImage, selfieImage } = req.body;

    // Validate required fields
    if (!documentType || !documentNumber || !expiryDate || !frontImage || !selfieImage) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const user = await User.findById(affiliateId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Initialize KYC object if not exists
    if (!user.kyc) {
      user.kyc = {
        status: 'pending',
        identity: {},
        address: {}
      };
    }

    // Update identity KYC
    user.kyc.identity = {
      documentType,
      documentNumber,
      expiryDate: new Date(expiryDate),
      frontImage,
      backImage,
      selfieImage,
      verified: false,
      submittedAt: new Date()
    };

    // Update overall KYC status
    user.kyc.status = 'pending';

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Identity KYC submitted successfully. Verification pending.',
      data: {
        kyc: user.kyc
      }
    });
  }),

  /**
   * @route   POST /api/affiliate/kyc/address
   * @desc    Submit address KYC documents
   * @access  Private (Affiliate)
   */
  submitAddressKYC: asyncHandler(async (req, res) => {
    const affiliateId = req.user._id;
    const { documentType, documentNumber, expiryDate, frontImage, backImage } = req.body;

    // Validate required fields
    if (!documentType || !documentNumber || !expiryDate || !frontImage) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const user = await User.findById(affiliateId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Initialize KYC object if not exists
    if (!user.kyc) {
      user.kyc = {
        status: 'pending',
        identity: {},
        address: {}
      };
    }

    // Update address KYC
    user.kyc.address = {
      documentType,
      documentNumber,
      expiryDate: new Date(expiryDate),
      frontImage,
      backImage,
      verified: false,
      submittedAt: new Date()
    };

    // Update overall KYC status
    user.kyc.status = 'pending';

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address KYC submitted successfully. Verification pending.',
      data: {
        kyc: user.kyc
      }
    });
  }),

  /**
   * @route   GET /api/affiliate/commission-designations
   * @desc    Get all commission designations with filters
   * @access  Private (Affiliate)
   */
  getCommissionDesignations: asyncHandler(async (req, res) => {
    const affiliateId = req.user._id;
    const { currency, status, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = { affiliateId };
    if (currency && currency !== 'All') {
      filter.currency = currency;
    }
    if (status && status !== 'All') {
      filter.status = status;
    }

    // Get total count
    const total = await CommissionDesignation.countDocuments(filter);

    // Get designations with pagination
    const designations = await CommissionDesignation.find(filter)
      .populate('playerId', 'username email phoneNumber')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: {
        designations,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  }),

  /**
   * @route   POST /api/affiliate/commission-designations
   * @desc    Create new commission designation
   * @access  Private (Affiliate)
   */
  createCommissionDesignation: asyncHandler(async (req, res) => {
    const affiliateId = req.user._id;
    const { playerId, currency, commissionRate, status, notes } = req.body;

    // Validate required fields
    if (!playerId || !currency || commissionRate === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide playerId, currency, and commission rate'
      });
    }

    // Validate commission rate
    if (commissionRate < 0 || commissionRate > 100) {
      return res.status(400).json({
        success: false,
        message: 'Commission rate must be between 0 and 100'
      });
    }

    // Check if player exists
    const player = await User.findById(playerId);
    if (!player) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      });
    }

    // Check if designation already exists
    const existingDesignation = await CommissionDesignation.findOne({
      affiliateId,
      playerId
    });

    if (existingDesignation) {
      return res.status(400).json({
        success: false,
        message: 'Commission designation already exists for this player'
      });
    }

    // Create designation
    const designation = await CommissionDesignation.create({
      affiliateId,
      playerId,
      currency,
      commissionRate,
      status: status || 'active',
      notes: notes || ''
    });

    // Populate player info
    await designation.populate('playerId', 'username email phoneNumber');

    res.status(201).json({
      success: true,
      message: 'Commission designation created successfully',
      data: {
        designation
      }
    });
  }),

  /**
   * @route   PUT /api/affiliate/commission-designations/:id
   * @desc    Update commission designation
   * @access  Private (Affiliate)
   */
  updateCommissionDesignation: asyncHandler(async (req, res) => {
    const affiliateId = req.user._id;
    const { id } = req.params;
    const { currency, commissionRate, status, notes } = req.body;

    // Find designation
    const designation = await CommissionDesignation.findOne({
      _id: id,
      affiliateId
    });

    if (!designation) {
      return res.status(404).json({
        success: false,
        message: 'Commission designation not found'
      });
    }

    // Validate commission rate if provided
    if (commissionRate !== undefined && (commissionRate < 0 || commissionRate > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Commission rate must be between 0 and 100'
      });
    }

    // Update fields
    if (currency) designation.currency = currency;
    if (commissionRate !== undefined) designation.commissionRate = commissionRate;
    if (status) designation.status = status;
    if (notes !== undefined) designation.notes = notes;

    await designation.save();
    await designation.populate('playerId', 'username email phoneNumber');

    res.status(200).json({
      success: true,
      message: 'Commission designation updated successfully',
      data: {
        designation
      }
    });
  }),

  /**
   * @route   DELETE /api/affiliate/commission-designations/:id
   * @desc    Delete commission designation
   * @access  Private (Affiliate)
   */
  deleteCommissionDesignation: asyncHandler(async (req, res) => {
    const affiliateId = req.user._id;
    const { id } = req.params;

    // Find and delete designation
    const designation = await CommissionDesignation.findOneAndDelete({
      _id: id,
      affiliateId
    });

    if (!designation) {
      return res.status(404).json({
        success: false,
        message: 'Commission designation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Commission designation deleted successfully'
    });
  }),

  /**
   * @route   GET /api/affiliate/links
   * @desc    Get all affiliate marketing links
   * @access  Private (Affiliate)
   */
  getAffiliateLinks: asyncHandler(async (req, res) => {
    const affiliateId = req.user._id;
    const { search, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = { affiliateId };
    if (search) {
      filter.$or = [
        { domain: { $regex: search, $options: 'i' } },
        { keywords: { $regex: search, $options: 'i' } },
        { page: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await AffiliateLink.countDocuments(filter);

    // Get links with pagination
    const links = await AffiliateLink.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: {
        links,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  }),

  /**
   * @route   POST /api/affiliate/links
   * @desc    Create new affiliate marketing link
   * @access  Private (Affiliate)
   */
  createAffiliateLink: asyncHandler(async (req, res) => {
    const affiliateId = req.user._id;
    const { domain, status, keywords, page } = req.body;

    // Validate required fields
    if (!domain || !page) {
      return res.status(400).json({
        success: false,
        message: 'Please provide domain and page'
      });
    }

    // Generate unique tracking code
    const trackingCode = `${affiliateId.toString().slice(-8)}${Date.now().toString(36)}`;

    // Create link
    const link = await AffiliateLink.create({
      affiliateId,
      domain,
      status: status || 'active',
      keywords: keywords || '',
      page,
      trackingCode,
      clicks: 0,
      conversions: 0
    });

    res.status(201).json({
      success: true,
      message: 'Affiliate link created successfully',
      data: {
        link
      }
    });
  }),

  /**
   * @route   PUT /api/affiliate/links/:id
   * @desc    Update affiliate marketing link
   * @access  Private (Affiliate)
   */
  updateAffiliateLink: asyncHandler(async (req, res) => {
    const affiliateId = req.user._id;
    const { id } = req.params;
    const { domain, status, keywords, page } = req.body;

    // Find link
    const link = await AffiliateLink.findOne({
      _id: id,
      affiliateId
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate link not found'
      });
    }

    // Update fields
    if (domain) link.domain = domain;
    if (status) link.status = status;
    if (keywords !== undefined) link.keywords = keywords;
    if (page) link.page = page;

    await link.save();

    res.status(200).json({
      success: true,
      message: 'Affiliate link updated successfully',
      data: {
        link
      }
    });
  }),

  /**
   * @route   DELETE /api/affiliate/links/:id
   * @desc    Delete affiliate marketing link
   * @access  Private (Affiliate)
   */
  deleteAffiliateLink: asyncHandler(async (req, res) => {
    const affiliateId = req.user._id;
    const { id } = req.params;

    // Find and delete link
    const link = await AffiliateLink.findOneAndDelete({
      _id: id,
      affiliateId
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate link not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Affiliate link deleted successfully'
    });
  }),

  /**
   * @route   GET /api/affiliate/links/:id/stats
   * @desc    Get link statistics
   * @access  Private (Affiliate)
   */
  getAffiliateLinkStats: asyncHandler(async (req, res) => {
    const affiliateId = req.user._id;
    const { id } = req.params;

    // Find link
    const link = await AffiliateLink.findOne({
      _id: id,
      affiliateId
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate link not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        clicks: link.clicks,
        conversions: link.conversions,
        conversionRate: link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(2) : 0
      }
    });
  }),

  /**
   * @route   GET /api/affiliate/member-search
   * @desc    Search affiliate members/referrals with advanced filters
   * @access  Private (Affiliate)
   */
  searchMembers: asyncHandler(async (req, res) => {
    const affiliateId = req.user._id;
    const {
      startDate,
      endDate,
      username,
      lastLoginIP,
      lastBetSince,
      lastDepositSince,
      currencyType,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter - members referred by this affiliate
    const filter = { referredBy: affiliateId };

    // Date range filter (registration date)
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set to end of day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateTime;
      }
    }

    // Username filter
    if (username) {
      filter.username = { $regex: username, $options: 'i' };
    }

    // Last Login IP filter
    if (lastLoginIP) {
      filter.lastLoginIP = { $regex: lastLoginIP, $options: 'i' };
    }

    // Get total count
    const total = await User.countDocuments(filter);

    // Get members with pagination
    let members = await User.find(filter)
      .select('username email phoneNumber createdAt lastLoginIP lastLoginTime currency')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Enrich members with additional data
    const enrichedMembers = await Promise.all(
      members.map(async (member) => {
        // Get last bet time
        const lastBet = await Bet.findOne({ userId: member._id })
          .sort({ createdAt: -1 })
          .select('createdAt')
          .lean();

        // Get last deposit time
        const lastDeposit = await Transaction.findOne({
          userId: member._id,
          type: 'deposit',
          status: 'completed'
        })
          .sort({ createdAt: -1 })
          .select('createdAt')
          .lean();

        // Generate affiliate URL (referral link)
        const affiliateURL = `https://yoursite.com/register?ref=${member._id}`;

        return {
          _id: member._id,
          username: member.username,
          email: member.email,
          phoneNumber: member.phoneNumber,
          registeredTime: member.createdAt,
          lastLoginIP: member.lastLoginIP || 'N/A',
          lastLoginTime: member.lastLoginTime || null,
          lastBetTime: lastBet ? lastBet.createdAt : null,
          lastDepositTime: lastDeposit ? lastDeposit.createdAt : null,
          currencyType: member.currency || 'BDT',
          affiliateURL
        };
      })
    );

    // Apply additional filters on enriched data
    let filteredMembers = enrichedMembers;

    // Filter by last bet time
    if (lastBetSince) {
      const betSinceDate = new Date(lastBetSince);
      filteredMembers = filteredMembers.filter(
        (member) => member.lastBetTime && new Date(member.lastBetTime) >= betSinceDate
      );
    }

    // Filter by last deposit time
    if (lastDepositSince) {
      const depositSinceDate = new Date(lastDepositSince);
      filteredMembers = filteredMembers.filter(
        (member) => member.lastDepositTime && new Date(member.lastDepositTime) >= depositSinceDate
      );
    }

    // Filter by currency type
    if (currencyType && currencyType !== 'All') {
      filteredMembers = filteredMembers.filter(
        (member) => member.currencyType === currencyType
      );
    }

    res.status(200).json({
      success: true,
      data: {
        members: filteredMembers,
        pagination: {
          total: filteredMembers.length,
          page: parseInt(page),
          pages: Math.ceil(filteredMembers.length / limit)
        }
      }
    });
  }),

  /**
   * @route   GET /api/affiliate/registrations-ftds
   * @desc    Get registrations and First Time Deposits report
   * @access  Private (Affiliate)
   */
  getRegistrationsFTDs: asyncHandler(async (req, res) => {
    const affiliateId = req.user._id;
    const {
      startDate,
      endDate,
      keywords,
      currency,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter for referred users
    const filter = { referredBy: affiliateId };

    // Date range filter (registration date)
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateTime;
      }
    }

    // Keywords filter (search in username)
    if (keywords && keywords !== 'All') {
      filter.username = { $regex: keywords, $options: 'i' };
    }

    // Currency filter
    if (currency && currency !== 'All') {
      filter.currency = currency;
    }

    // Get total count
    const total = await User.countDocuments(filter);

    // Get registered users
    const registeredUsers = await User.find(filter)
      .select('username currency createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Enrich with FTD data
    const enrichedData = await Promise.all(
      registeredUsers.map(async (user) => {
        // Find first deposit
        const firstDeposit = await Transaction.findOne({
          userId: user._id,
          type: 'deposit',
          status: 'completed'
        })
          .sort({ createdAt: 1 })
          .select('amount createdAt')
          .lean();

        // Find first bet
        const firstBet = await Bet.findOne({
          userId: user._id
        })
          .sort({ createdAt: 1 })
          .select('amount createdAt')
          .lean();

        return {
          _id: user._id,
          username: user.username,
          keywords: keywords || 'All',
          currency: user.currency || 'BDT',
          registrationTime: user.createdAt,
          firstDepositTime: firstDeposit ? firstDeposit.createdAt : null,
          firstDepositAmount: firstDeposit ? firstDeposit.amount : 0,
          firstBetTime: firstBet ? firstBet.createdAt : null,
          firstBetAmount: firstBet ? firstBet.amount : 0
        };
      })
    );

    // Calculate totals
    const pageTotal = {
      firstDeposit: enrichedData.reduce((sum, item) => sum + item.firstDepositAmount, 0),
      firstBet: enrichedData.reduce((sum, item) => sum + item.firstBetAmount, 0),
      lastBet: enrichedData.reduce((sum, item) => sum + item.firstBetAmount, 0) // Same as first for now
    };

    // Get grand totals (all records, not just current page)
    const allUsers = await User.find({ referredBy: affiliateId }).select('_id').lean();
    const allUserIds = allUsers.map(u => u._id);

    const [grandTotalDeposits, grandTotalBets] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            userId: { $in: allUserIds },
            type: 'deposit',
            status: 'completed'
          }
        },
        {
          $group: {
            _id: '$userId',
            firstDeposit: { $first: '$amount' }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$firstDeposit' }
          }
        }
      ]),
      Bet.aggregate([
        {
          $match: {
            userId: { $in: allUserIds }
          }
        },
        {
          $group: {
            _id: '$userId',
            firstBet: { $first: '$amount' }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$firstBet' }
          }
        }
      ])
    ]);

    const grandTotal = {
      firstDeposit: grandTotalDeposits[0]?.total || 0,
      firstBet: grandTotalBets[0]?.total || 0,
      lastBet: grandTotalBets[0]?.total || 0
    };

    res.status(200).json({
      success: true,
      data: {
        registrations: enrichedData,
        pageTotal,
        grandTotal,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  }),

  /**
   * @route   GET /api/affiliate/performance
   * @desc    Get performance metrics for players or downline
   * @access  Private (Affiliate)
   */
  getPerformance: asyncHandler(async (req, res) => {
    const affiliateId = req.user._id;
    const {
      type = 'player', // 'player' or 'downline'
      player,
      startDate,
      endDate,
      currency,
      keywords,
      page = 1,
      limit = 10
    } = req.query;

    let filter = {};

    // Different filters for Player vs Downline tabs
    if (type === 'player') {
      // Direct referrals
      filter.referredBy = affiliateId;
    } else if (type === 'downline') {
      // Get all downline affiliates
      const downlineAffiliates = await User.find({ referredBy: affiliateId, isAffiliate: true }).select('_id');
      const downlineIds = downlineAffiliates.map(a => a._id);
      
      if (downlineIds.length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            players: [],
            pageTotal: {
              totalDeposit: 0,
              totalDepositPaymentFee: 0,
              totalWithdrawal: 0,
              totalWithdrawalPaymentFee: 0,
              totalNumberOfBets: 0,
              totalTurnover: 0,
              profitLoss: 0,
              totalJackpot: 0
            },
            grandTotal: {
              totalDeposit: 0,
              totalDepositPaymentFee: 0,
              totalWithdrawal: 0,
              totalWithdrawalPaymentFee: 0,
              totalNumberOfBets: 0,
              totalTurnover: 0,
              profitLoss: 0,
              totalJackpot: 0
            },
            pagination: {
              total: 0,
              page: 1,
              pages: 0
            }
          }
        });
      }
      
      filter.referredBy = { $in: downlineIds };
    }

    // Player name search
    if (player) {
      filter.username = { $regex: player, $options: 'i' };
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateTime;
      }
    }

    // Currency filter
    if (currency && currency !== 'All') {
      filter.currency = currency;
    }

    // Keywords filter (search in username for now)
    if (keywords && keywords !== 'All') {
      filter.username = { $regex: keywords, $options: 'i' };
    }

    // Get total count
    const total = await User.countDocuments(filter);

    // Get users with pagination
    const users = await User.find(filter)
      .select('username email phone currency createdAt lastLoginIP lastLoginTime')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Enrich with performance data
    const enrichedData = await Promise.all(
      users.map(async (user) => {
        // Get deposit statistics
        const depositStats = await Transaction.aggregate([
          {
            $match: {
              userId: user._id,
              type: 'deposit',
              status: 'completed'
            }
          },
          {
            $group: {
              _id: null,
              totalDeposit: { $sum: '$amount' },
              totalFee: { $sum: { $ifNull: ['$fee', 0] } }
            }
          }
        ]);

        // Get withdrawal statistics
        const withdrawalStats = await Transaction.aggregate([
          {
            $match: {
              userId: user._id,
              type: 'withdrawal',
              status: 'completed'
            }
          },
          {
            $group: {
              _id: null,
              totalWithdrawal: { $sum: '$amount' },
              totalFee: { $sum: { $ifNull: ['$fee', 0] } }
            }
          }
        ]);

        // Get betting statistics
        const betStats = await Bet.aggregate([
          {
            $match: {
              userId: user._id
            }
          },
          {
            $group: {
              _id: null,
              totalBets: { $sum: 1 },
              totalTurnover: { $sum: '$amount' },
              totalWinnings: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, '$winAmount', 0] } }
            }
          }
        ]);

        // Get first deposit
        const firstDeposit = await Transaction.findOne({
          userId: user._id,
          type: 'deposit',
          status: 'completed'
        })
          .sort({ createdAt: 1 })
          .select('createdAt')
          .lean();

        const depositData = depositStats[0] || { totalDeposit: 0, totalFee: 0 };
        const withdrawalData = withdrawalStats[0] || { totalWithdrawal: 0, totalFee: 0 };
        const betData = betStats[0] || { totalBets: 0, totalTurnover: 0, totalWinnings: 0 };

        // Calculate profit/loss (deposits - withdrawals - winnings)
        const profitLoss = depositData.totalDeposit - withdrawalData.totalWithdrawal - betData.totalWinnings;

        return {
          _id: user._id,
          username: user.username,
          keyword: keywords || 'All',
          signUpCountry: '', // Add if you have country field in User model
          currency: user.currency || 'BDT',
          registrationTime: user.createdAt,
          firstDepositTime: firstDeposit ? firstDeposit.createdAt : null,
          phoneNumber: user.phone || '',
          emailAddress: user.email || '',
          signUpIP: '', // Add if you have signUpIP field in User model
          lastLoginIP: user.lastLoginIP || '',
          lastLoginTime: user.lastLoginTime || null,
          totalDeposit: depositData.totalDeposit,
          totalDepositPaymentFee: depositData.totalFee,
          totalWithdrawal: withdrawalData.totalWithdrawal,
          totalWithdrawalPaymentFee: withdrawalData.totalFee,
          totalNumberOfBets: betData.totalBets,
          totalTurnover: betData.totalTurnover,
          profitLoss: profitLoss,
          totalJackpot: 0 // Add if you have jackpot tracking
        };
      })
    );

    // Calculate page totals
    const pageTotal = {
      totalDeposit: enrichedData.reduce((sum, item) => sum + item.totalDeposit, 0),
      totalDepositPaymentFee: enrichedData.reduce((sum, item) => sum + item.totalDepositPaymentFee, 0),
      totalWithdrawal: enrichedData.reduce((sum, item) => sum + item.totalWithdrawal, 0),
      totalWithdrawalPaymentFee: enrichedData.reduce((sum, item) => sum + item.totalWithdrawalPaymentFee, 0),
      totalNumberOfBets: enrichedData.reduce((sum, item) => sum + item.totalNumberOfBets, 0),
      totalTurnover: enrichedData.reduce((sum, item) => sum + item.totalTurnover, 0),
      profitLoss: enrichedData.reduce((sum, item) => sum + item.profitLoss, 0),
      totalJackpot: enrichedData.reduce((sum, item) => sum + item.totalJackpot, 0)
    };

    // Calculate grand totals for all filtered users
    const allUsers = await User.find(filter).select('_id').lean();
    const allUserIds = allUsers.map(u => u._id);

    const [grandDepositStats, grandWithdrawalStats, grandBetStats] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            userId: { $in: allUserIds },
            type: 'deposit',
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            totalDeposit: { $sum: '$amount' },
            totalFee: { $sum: { $ifNull: ['$fee', 0] } }
          }
        }
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: { $in: allUserIds },
            type: 'withdrawal',
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            totalWithdrawal: { $sum: '$amount' },
            totalFee: { $sum: { $ifNull: ['$fee', 0] } }
          }
        }
      ]),
      Bet.aggregate([
        {
          $match: {
            userId: { $in: allUserIds }
          }
        },
        {
          $group: {
            _id: null,
            totalBets: { $sum: 1 },
            totalTurnover: { $sum: '$amount' },
            totalWinnings: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, '$winAmount', 0] } }
          }
        }
      ])
    ]);

    const grandDepositData = grandDepositStats[0] || { totalDeposit: 0, totalFee: 0 };
    const grandWithdrawalData = grandWithdrawalStats[0] || { totalWithdrawal: 0, totalFee: 0 };
    const grandBetData = grandBetStats[0] || { totalBets: 0, totalTurnover: 0, totalWinnings: 0 };

    const grandTotal = {
      totalDeposit: grandDepositData.totalDeposit,
      totalDepositPaymentFee: grandDepositData.totalFee,
      totalWithdrawal: grandWithdrawalData.totalWithdrawal,
      totalWithdrawalPaymentFee: grandWithdrawalData.totalFee,
      totalNumberOfBets: grandBetData.totalBets,
      totalTurnover: grandBetData.totalTurnover,
      profitLoss: grandDepositData.totalDeposit - grandWithdrawalData.totalWithdrawal - grandBetData.totalWinnings,
      totalJackpot: 0
    };

    res.status(200).json({
      success: true,
      data: {
        players: enrichedData,
        pageTotal,
        grandTotal,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  }),

  /**
   * @route   GET /api/affiliate/commissions
   * @desc    Get commission records for affiliate
   * @access  Private (Affiliate)
   */
  getCommissions: asyncHandler(async (req, res) => {
    const affiliateId = req.user._id;
    const {
      type = 'myAccount', // 'myAccount' or 'downline'
      startDate,
      endDate,
      currency,
      page = 1,
      limit = 10
    } = req.query;

    // For this implementation, we'll create commission records based on performance data
    // In production, you'd have a Commission model to store actual commission records

    let filter = {};
    let targetAffiliateIds = [affiliateId];

    // For downline tab, get commissions from downline affiliates
    if (type === 'downline') {
      const downlineAffiliates = await User.find({ 
        referredBy: affiliateId, 
        isAffiliate: true 
      }).select('_id');
      
      if (downlineAffiliates.length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            commissions: [],
            pageTotal: {
              netProfit: 0,
              commission: 0
            },
            pagination: {
              total: 0,
              page: 1,
              pages: 0
            }
          }
        });
      }
      
      targetAffiliateIds = downlineAffiliates.map(a => a._id);
    }

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      if (startDate) {
        dateFilter.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        dateFilter.$lte = endDateTime;
      }
    }

    // Calculate commissions for each affiliate
    const commissionRecords = [];
    
    for (const affId of targetAffiliateIds) {
      // Get referred players
      const referredPlayers = await User.find({ referredBy: affId }).select('_id currency');
      
      if (referredPlayers.length === 0) continue;

      // Group by currency
      const currencyGroups = {};
      referredPlayers.forEach(player => {
        const curr = player.currency || 'BDT';
        if (!currencyGroups[curr]) {
          currencyGroups[curr] = [];
        }
        currencyGroups[curr].push(player._id);
      });

      // Calculate commission for each currency
      for (const [curr, playerIds] of Object.entries(currencyGroups)) {
        // Skip if currency filter doesn't match
        if (currency && currency !== 'All' && curr !== currency) {
          continue;
        }

        // Get deposits for these players
        const depositMatch = {
          userId: { $in: playerIds },
          type: 'deposit',
          status: 'completed'
        };
        if (Object.keys(dateFilter).length > 0) {
          depositMatch.createdAt = dateFilter;
        }

        const depositStats = await Transaction.aggregate([
          { $match: depositMatch },
          {
            $group: {
              _id: null,
              totalDeposit: { $sum: '$amount' }
            }
          }
        ]);

        // Get withdrawals
        const withdrawalMatch = {
          userId: { $in: playerIds },
          type: 'withdrawal',
          status: 'completed'
        };
        if (Object.keys(dateFilter).length > 0) {
          withdrawalMatch.createdAt = dateFilter;
        }

        const withdrawalStats = await Transaction.aggregate([
          { $match: withdrawalMatch },
          {
            $group: {
              _id: null,
              totalWithdrawal: { $sum: '$amount' }
            }
          }
        ]);

        // Get bet winnings
        const betMatch = { userId: { $in: playerIds } };
        if (Object.keys(dateFilter).length > 0) {
          betMatch.createdAt = dateFilter;
        }

        const betStats = await Bet.aggregate([
          { $match: betMatch },
          {
            $group: {
              _id: null,
              totalWinnings: { 
                $sum: { 
                  $cond: [
                    { $eq: ['$status', 'won'] }, 
                    '$winAmount', 
                    0
                  ] 
                } 
              }
            }
          }
        ]);

        const totalDeposit = depositStats[0]?.totalDeposit || 0;
        const totalWithdrawal = withdrawalStats[0]?.totalWithdrawal || 0;
        const totalWinnings = betStats[0]?.totalWinnings || 0;

        // Calculate net profit (house profit)
        const netProfit = totalDeposit - totalWithdrawal - totalWinnings;

        // Get affiliate's commission rate (default 30%)
        const affiliate = await User.findById(affId).select('commissionRate');
        const commissionRate = affiliate?.commissionRate || 0.30;

        // Calculate commission
        const commission = netProfit > 0 ? netProfit * commissionRate : 0;

        if (netProfit !== 0 || commission !== 0) {
          commissionRecords.push({
            _id: `${affId}_${curr}_${Date.now()}`,
            affiliateId: affId,
            startDate: startDate ? new Date(startDate) : new Date(new Date().setDate(1)), // First day of current month
            currency: curr,
            netProfit: netProfit,
            commission: commission,
            period: 'Monthly',
            status: commission > 0 ? 'pending' : 'n/a',
            createdAt: new Date()
          });
        }
      }
    }

    // Sort by date
    commissionRecords.sort((a, b) => b.startDate - a.startDate);

    // Apply pagination
    const total = commissionRecords.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedRecords = commissionRecords.slice(startIndex, endIndex);

    // Calculate page totals
    const pageTotal = {
      netProfit: paginatedRecords.reduce((sum, record) => sum + record.netProfit, 0),
      commission: paginatedRecords.reduce((sum, record) => sum + record.commission, 0)
    };

    res.status(200).json({
      success: true,
      data: {
        commissions: paginatedRecords,
        pageTotal,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  }),
};



