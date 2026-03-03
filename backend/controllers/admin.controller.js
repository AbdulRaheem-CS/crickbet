/**
 * Admin Controller
 * Handles all admin panel operations
 * Phase 5: Admin Panel Implementation
 */

const { asyncHandler } = require('../middleware/error.middleware');
const User = require('../models/User');
const Bet = require('../models/Bet');
const Market = require('../models/Market');
const Transaction = require('../models/Transaction');
const KYC = require('../models/KYC');
const walletService = require('../services/wallet.service');
const bettingService = require('../services/betting.service');
const marketService = require('../services/market.service');
const { emitBetVoided, emitMarketSettled } = require('../sockets/betting.socket');

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination and filters
 * @access  Admin
 */
exports.getUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    role,
    search,
    sortBy = 'createdAt',
    order = 'desc',
  } = req.query;

  const query = {};

  // Filters
  if (status) query.status = status;
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOrder = order === 'desc' ? -1 : 1;

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    User.countDocuments(query),
  ]);

  // Map to include a boolean kycVerified (frontend expects this flag)
  const mappedUsers = users.map((u) => ({
    ...u,
    // prefer explicit kycVerified flag if present, otherwise derive from kycStatus
    kycVerified: (typeof u.kycVerified !== 'undefined' && u.kycVerified) || (u.kycStatus === 'verified') || false,
  }));

  res.status(200).json({
    success: true,
    data: mappedUsers,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID with full details
 * @access  Admin
 */
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password').lean();

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Get user statistics
  const [wallet, betsCount, totalWagered, kycStatus] = await Promise.all([
    walletService.getWallet(user._id),
    Bet.countDocuments({ userId: user._id }),
    Bet.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: null, total: { $sum: '$stake' } } },
    ]),
    KYC.findOne({ userId: user._id }).select('status verificationLevel').lean(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      ...user,
      wallet: {
        balance: wallet?.balance || 0,
        exposure: wallet?.exposure || 0,
        bonusBalance: wallet?.bonusBalance || 0,
      },
      stats: {
        totalBets: betsCount,
        totalWagered: totalWagered[0]?.total || 0,
        kycStatus: kycStatus?.status || 'not_submitted',
        kycLevel: kycStatus?.verificationLevel || 0,
      },
    },
  });
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user details
 * @access  Admin
 */
exports.updateUser = asyncHandler(async (req, res) => {
  const { username, email, phone, role, kycVerified } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Update fields
  if (username) user.username = username;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (role) user.role = role;
  if (kycVerified !== undefined) user.kycVerified = kycVerified;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});

/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Change user status (active/suspended/banned)
 * @access  Admin
 */
exports.changeUserStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;

  if (!['active', 'suspended', 'banned'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be: active, suspended, or banned',
    });
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  user.status = status;
  if (reason) {
    user.statusReason = reason;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: `User status changed to ${status}`,
    data: {
      id: user._id,
      username: user.username,
      status: user.status,
    },
  });
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user (soft delete)
 * @access  Admin
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Check if user has balance
  const wallet = await walletService.getWallet(user._id);
  if (wallet && wallet.balance > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete user with remaining balance',
    });
  }

  // Soft delete
  user.status = 'deleted';
  user.deletedAt = new Date();
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

/**
 * @route   GET /api/admin/affiliates/pending
 * @desc    Get pending affiliate registrations
 * @access  Admin
 */
exports.getPendingAffiliates = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [affiliates, total] = await Promise.all([
    User.find({ role: 'affiliate', status: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    User.countDocuments({ role: 'affiliate', status: 'pending' })
  ]);

  res.status(200).json({
    success: true,
    data: affiliates,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// ============================================
// KYC MANAGEMENT
// ============================================

/**
 * @route   GET /api/admin/kyc/pending
 * @desc    Get all pending KYC submissions
 * @access  Admin
 */
exports.getPendingKYC = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [kycs, total] = await Promise.all([
    KYC.find({ status: 'pending' })
      // ensure we populate the actual 'user' ref; some KYC docs may use alias 'userId'
      .populate('user', 'username email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    KYC.countDocuments({ status: 'pending' }),
  ]);

  // Map KYC documents to the flattened shape expected by the admin UI
  const mapped = kycs.map((k) => {
    const userObj = k.user || k.userId || null;
    return {
      _id: k._id,
      userId: userObj
        ? { _id: userObj._id || userObj, username: userObj.username || 'N/A', email: userObj.email || 'N/A', phone: userObj.phone }
        : null,
      documentType: k.identityDocument?.type || k.addressDocument?.type || null,
      documentNumber: k.identityDocument?.number || k.addressDocument?.number || null,
      documentFront: k.identityDocument?.frontImage || null,
      documentBack: k.identityDocument?.backImage || null,
      selfieImage: k.selfieWithId?.image || null,
      addressProof: k.addressDocument?.image || k.addressDocument?.image || null,
      status: k.status,
      rejectionReason: k.rejectionReason || null,
      verifiedAt: k.verifiedAt || null,
      submittedAt: k.submittedAt || k.createdAt || null,
      raw: k,
    };
  });

  res.status(200).json({
    success: true,
    data: mapped,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * @route   GET /api/admin/kyc/:id
 * @desc    Get KYC details by ID
 * @access  Admin
 */
exports.getKYCById = asyncHandler(async (req, res) => {
  const kyc = await KYC.findById(req.params.id)
    .populate('user', 'username email phone createdAt')
    .lean();

  if (!kyc) {
    return res.status(404).json({
      success: false,
      message: 'KYC submission not found',
    });
  }

  const userObj = kyc.user || kyc.userId || null;
  const mapped = {
    _id: kyc._id,
    userId: userObj ? { _id: userObj._id || userObj, username: userObj.username || 'N/A', email: userObj.email || 'N/A', phone: userObj.phone } : null,
    documentType: kyc.identityDocument?.type || kyc.addressDocument?.type || null,
    documentNumber: kyc.identityDocument?.number || kyc.addressDocument?.number || null,
    documentFront: kyc.identityDocument?.frontImage || null,
    documentBack: kyc.identityDocument?.backImage || null,
    selfieImage: kyc.selfieWithId?.image || null,
    addressProof: kyc.addressDocument?.image || null,
    status: kyc.status,
    rejectionReason: kyc.rejectionReason || null,
    verifiedAt: kyc.verifiedAt || null,
    submittedAt: kyc.submittedAt || kyc.createdAt || null,
    raw: kyc,
  };

  res.status(200).json({
    success: true,
    data: mapped,
  });
});

/**
 * @route   POST /api/admin/kyc/:id/approve
 * @desc    Approve KYC submission
 * @access  Admin
 */
exports.approveKYC = asyncHandler(async (req, res) => {
  const { verificationLevel = 1 } = req.body;

  const kyc = await KYC.findById(req.params.id);

  if (!kyc) {
    return res.status(404).json({
      success: false,
      message: 'KYC submission not found',
    });
  }

  // Use a safe update that sets the KYC to a valid enum state and avoids running schema-level required validations
  const updated = await KYC.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        status: 'verified',
        verificationLevel: verificationLevel,
        verifiedBy: req.user._id,
        verifiedAt: new Date(),
      },
    },
    { new: true, runValidators: false }
  );

  // Update user KYC flag
  const userId = (updated.user && (updated.user._id || updated.user)) || updated.userId || updated.user;
  if (userId) {
    // Update user canonical KYC flags and mirror verification into embedded user.kyc
    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          kycVerified: true,
          kycStatus: 'verified',
          kycVerifiedAt: new Date(),
          'kyc.status': 'verified',
          'kyc.verifiedAt': new Date(),
          'kyc.identity.verified': true,
          'kyc.address.verified': true,
        },
      },
      { new: true }
    );
  }

  res.status(200).json({ success: true, message: 'KYC approved successfully', data: updated });
});

/**
 * @route   POST /api/admin/kyc/:id/reject
 * @desc    Reject KYC submission
 * @access  Admin
 */
exports.rejectKYC = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required',
    });
  }

  const updated = await KYC.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        status: 'rejected',
        rejectionReason: reason,
        verifiedBy: req.user._id,
        verifiedAt: new Date(),
      },
    },
    { new: true, runValidators: false }
  );

  if (!updated) {
    return res.status(404).json({ success: false, message: 'KYC submission not found' });
  }

  res.status(200).json({ success: true, message: 'KYC rejected', data: updated });
});

// ============================================
// BET MANAGEMENT
// ============================================

/**
 * @route   GET /api/admin/bets
 * @desc    Get all bets with filters
 * @access  Admin
 */
exports.getAllBets = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    userId,
    marketId,
    startDate,
    endDate,
  } = req.query;

  const query = {};

  if (status) query.status = status;
  if (userId) query.user = userId;
  if (marketId) query.market = marketId;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [bets, total] = await Promise.all([
    Bet.find(query)
      .populate('user', 'username email')
      .populate('market', 'name sportId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Bet.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: bets,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * @route   GET /api/admin/bets/:id
 * @desc    Get bet by ID
 * @access  Admin
 */
exports.getBetById = asyncHandler(async (req, res) => {
  const bet = await Bet.findById(req.params.id)
    .populate('user', 'username email phone')
    .populate('market', 'name sportId eventId status')
    .lean();

  if (!bet) {
    return res.status(404).json({
      success: false,
      message: 'Bet not found',
    });
  }

  res.status(200).json({
    success: true,
    data: bet,
  });
});

/**
 * @route   POST /api/admin/bets/:id/void
 * @desc    Void a bet (refund to user)
 * @access  Admin
 */
exports.voidBet = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      message: 'Void reason is required',
    });
  }

  const bet = await Bet.findById(req.params.id);

  if (!bet) {
    return res.status(404).json({
      success: false,
      message: 'Bet not found',
    });
  }

  if (bet.status === 'voided') {
    return res.status(400).json({
      success: false,
      message: 'Bet is already voided',
    });
  }

  if (bet.status === 'settled') {
    return res.status(400).json({
      success: false,
      message: 'Cannot void a settled bet',
    });
  }

  // Void bet via service
  await bettingService.voidBet(bet._id, reason);

  // Emit socket event
  emitBetVoided(bet.userId.toString(), {
    _id: bet._id,
    marketId: bet.marketId,
    stake: bet.stake,
    voidReason: reason,
  });

  res.status(200).json({
    success: true,
    message: 'Bet voided successfully',
    data: {
      betId: bet._id,
      refundAmount: bet.stake,
    },
  });
});

// ============================================
// MARKET MANAGEMENT
// ============================================

/**
 * @route   GET /api/admin/markets
 * @desc    Get all markets
 * @access  Admin
 */
exports.getAllMarkets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, sportId } = req.query;

  const query = {};
  if (status) query.status = status;
  if (sportId) query.sportId = sportId;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [markets, total] = await Promise.all([
    Market.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Market.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: markets,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * @route   POST /api/admin/markets
 * @desc    Create a new market
 * @access  Admin
 */
exports.createMarket = asyncHandler(async (req, res) => {
  const marketData = req.body;

  const market = await marketService.createMarket(marketData);

  res.status(201).json({
    success: true,
    message: 'Market created successfully',
    data: market,
  });
});

/**
 * @route   PUT /api/admin/markets/:id
 * @desc    Update market
 * @access  Admin
 */
exports.updateMarket = asyncHandler(async (req, res) => {
  const updates = req.body;

  const market = await marketService.updateMarket(req.params.id, updates);

  if (!market) {
    return res.status(404).json({
      success: false,
      message: 'Market not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Market updated successfully',
    data: market,
  });
});

/**
 * @route   POST /api/admin/markets/:id/settle
 * @desc    Settle a market
 * @access  Admin
 */
exports.settleMarket = asyncHandler(async (req, res) => {
  const { winner, result } = req.body;

  if (!winner) {
    return res.status(400).json({
      success: false,
      message: 'Winner is required',
    });
  }

  const settled = await marketService.settleMarket(req.params.id, winner, req.user?._id);

  // Emit socket event
  emitMarketSettled(req.params.id, {
    winner,
    settledAt: new Date().toISOString(),
  });

  res.status(200).json({
    success: true,
    message: 'Market settled successfully',
    data: settled,
  });
});

/**
 * @route   POST /api/admin/markets/:id/void
 * @desc    Void a market
 * @access  Admin
 */
exports.voidMarket = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      message: 'Reason is required',
    });
  }

  const voided = await marketService.voidMarket(req.params.id, reason);

  res.status(200).json({
    success: true,
    message: 'Market voided successfully',
    data: voided,
  });
});

// ============================================
// WITHDRAWAL MANAGEMENT
// ============================================

/**
 * @route   GET /api/admin/withdrawals/pending
 * @desc    Get pending withdrawals
 * @access  Admin
 */
exports.getPendingWithdrawals = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [withdrawals, total] = await Promise.all([
    Transaction.find({
      type: 'withdrawal',
      status: 'pending',
    })
      .populate('user', 'username email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Transaction.countDocuments({ type: 'withdrawal', status: 'pending' }),
  ]);

  res.status(200).json({
    success: true,
    data: withdrawals,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * @route   POST /api/admin/withdrawals/:id/approve
 * @desc    Approve withdrawal (already implemented in wallet service)
 * @access  Admin
 */
exports.approveWithdrawal = asyncHandler(async (req, res) => {
  const { txnId, remarks } = req.body;

  const result = await walletService.approveWithdrawal(
    req.params.id,
    req.user._id,
    { txnId, remarks }
  );

  res.status(200).json({
    success: true,
    message: 'Withdrawal approved successfully',
    data: result,
  });
});

/**
 * @route   POST /api/admin/withdrawals/:id/reject
 * @desc    Reject withdrawal
 * @access  Admin
 */
exports.rejectWithdrawal = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required',
    });
  }

  const result = await walletService.rejectWithdrawal(
    req.params.id,
    req.user._id,
    reason
  );

  res.status(200).json({
    success: true,
    message: 'Withdrawal rejected',
    data: result,
  });
});

/**
 * @route   GET /api/admin/transactions
 * @desc    Get all transactions
 * @access  Admin
 */
exports.getAllTransactions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    type,
    status,
    userId,
    startDate,
    endDate,
  } = req.query;

  const query = {};

  if (type) query.type = type;
  if (status) query.status = status;
  if (userId) query.user = userId;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Transaction.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: transactions,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * @route   GET /api/admin/transactions/:id
 * @desc    Get transaction by ID
 * @access  Admin
 */
exports.getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('user', 'username email phone')
    .lean();

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found',
    });
  }

  res.status(200).json({
    success: true,
    data: transaction,
  });
});

/**
 * @route   PUT /api/admin/transactions/:id/status
 * @desc    Update transaction status
 * @access  Admin
 */
exports.updateTransactionStatus = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Status is required',
    });
  }

  const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    });
  }

  const transaction = await Transaction.findByIdAndUpdate(
    req.params.id,
    {
      status,
      remarks,
      updatedAt: Date.now(),
    },
    { new: true, runValidators: true }
  );

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Transaction status updated successfully',
    data: transaction,
  });
});

// ============================================
// PLATFORM STATISTICS
// ============================================

/**
 * @route   GET /api/admin/stats/overview
 * @desc    Get platform overview statistics
 * @access  Admin
 */
exports.getOverviewStats = asyncHandler(async (req, res) => {
  const { period = '7d' } = req.query;

  // Calculate date range
  const days = parseInt(period) || 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [
    totalUsers,
    activeUsers,
    newUsers,
    totalBets,
    activeBets,
    totalRevenue,
    totalDeposits,
    totalWithdrawals,
    pendingWithdrawals,
    pendingKYC,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({
      lastLoginAt: { $gte: startDate },
    }),
    User.countDocuments({
      createdAt: { $gte: startDate },
    }),
    Bet.countDocuments(),
    Bet.countDocuments({ status: { $in: ['pending', 'matched'] } }),
    Transaction.aggregate([
      {
        $match: {
          type: 'bet_settlement',
          profitLoss: { $lt: 0 },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $abs: '$amount' } },
        },
      },
    ]),
    Transaction.aggregate([
      {
        $match: {
          type: 'deposit',
          status: 'completed',
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]),
    Transaction.aggregate([
      {
        $match: {
          type: 'withdrawal',
          status: 'completed',
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]),
    Transaction.countDocuments({ type: 'withdrawal', status: 'pending' }),
    KYC.countDocuments({ status: 'pending' }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
      },
      bets: {
        total: totalBets,
        active: activeBets,
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        deposits: totalDeposits[0]?.total || 0,
        withdrawals: totalWithdrawals[0]?.total || 0,
        netRevenue:
          (totalRevenue[0]?.total || 0) -
          (totalDeposits[0]?.total || 0) +
          (totalWithdrawals[0]?.total || 0),
      },
      pending: {
        withdrawals: pendingWithdrawals,
        kyc: pendingKYC,
      },
      period: `${days} days`,
    },
  });
});

/**
 * @route   GET /api/admin/stats/revenue
 * @desc    Get revenue report
 * @access  Admin
 */
exports.getRevenueReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;

  const match = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  // Group by format
  const groupFormats = {
    day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
    week: { $dateToString: { format: '%Y-W%V', date: '$createdAt' } },
    month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
  };

  const revenue = await Transaction.aggregate([
    {
      $match: {
        ...match,
        type: { $in: ['deposit', 'withdrawal', 'bet_settlement'] },
        status: 'completed',
      },
    },
    {
      $group: {
        _id: {
          date: groupFormats[groupBy],
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.date': 1 },
    },
  ]);

  res.status(200).json({
    success: true,
    data: revenue,
  });
});

/**
 * @route   GET /api/admin/stats/users
 * @desc    Get user statistics
 * @access  Admin
 */
exports.getUsersReport = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;

  const days = parseInt(period) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const userStats = await User.aggregate([
    {
      $facet: {
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ],
        byRole: [
          { $group: { _id: '$role', count: { $sum: 1 } } },
        ],
        byKYC: [
          { $group: { _id: '$kycVerified', count: { $sum: 1 } } },
        ],
        registrationTrend: [
          {
            $match: { createdAt: { $gte: startDate } },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: userStats[0],
  });
});

/**
 * @route   GET /api/admin/stats/bets
 * @desc    Get betting statistics
 * @access  Admin
 */
exports.getBetsReport = asyncHandler(async (req, res) => {
  const { period = '7d' } = req.query;

  const days = parseInt(period) || 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const betStats = await Bet.aggregate([
    {
      $match: { createdAt: { $gte: startDate } },
    },
    {
      $facet: {
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ],
        byType: [
          { $group: { _id: '$type', count: { $sum: 1 }, total: { $sum: '$stake' } } },
        ],
        byMarket: [
          {
            $group: {
              _id: '$marketId',
              count: { $sum: 1 },
              totalStake: { $sum: '$stake' },
            },
          },
          { $sort: { totalStake: -1 } },
          { $limit: 10 },
        ],
        dailyTrend: [
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
              },
              count: { $sum: 1 },
              totalStake: { $sum: '$stake' },
            },
          },
          { $sort: { _id: 1 } },
        ],
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: betStats[0],
  });
});

// ============================================
// PROMOTION MANAGEMENT
// ============================================

const Promotion = require('../models/Promotion');

/**
 * @route   GET /api/admin/promotions
 * @desc    Get all promotions
 * @access  Admin
 */
exports.getPromotions = asyncHandler(async (req, res) => {
  const { status, type, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) {
    query.isActive = status === 'active';
  }
  if (type) {
    query.type = type;
  }

  const promotions = await Promotion.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const count = await Promotion.countDocuments(query);

  res.status(200).json({
    success: true,
    data: promotions,
    pagination: {
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
    },
  });
});

/**
 * @route   POST /api/admin/promotions
 * @desc    Create new promotion
 * @access  Admin
 */
exports.createPromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Promotion created successfully',
    data: promotion,
  });
});

/**
 * @route   PUT /api/admin/promotions/:id
 * @desc    Update promotion
 * @access  Admin
 */
exports.updatePromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!promotion) {
    return res.status(404).json({
      success: false,
      message: 'Promotion not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Promotion updated successfully',
    data: promotion,
  });
});

/**
 * @route   DELETE /api/admin/promotions/:id
 * @desc    Delete promotion
 * @access  Admin
 */
exports.deletePromotion = asyncHandler(async (req, res) => {
  const promotion = await Promotion.findByIdAndDelete(req.params.id);

  if (!promotion) {
    return res.status(404).json({
      success: false,
      message: 'Promotion not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Promotion deleted successfully',
  });
});

// ============================================
// REPORTS
// ============================================

/**
 * @route   GET /api/admin/reports/overview
 * @desc    Get platform overview report
 * @access  Admin
 */
exports.getOverviewReport = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;

  const days = parseInt(period) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get statistics
  const [userCount, totalBets, totalDeposits, totalWithdrawals, activeBets] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: startDate } }),
    Bet.countDocuments({ createdAt: { $gte: startDate } }),
    Transaction.aggregate([
      { $match: { type: 'deposit', status: 'completed', createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      { $match: { type: 'withdrawal', status: 'completed', createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Bet.countDocuments({ status: 'pending' }),
  ]);

  const totalBetAmount = await Bet.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $group: { _id: null, total: { $sum: '$stake' } } },
  ]);

  const totalPayout = await Bet.aggregate([
    { $match: { status: 'won', createdAt: { $gte: startDate } } },
    { $group: { _id: null, total: { $sum: '$potentialProfit' } } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      period: `${days} days`,
      users: {
        new: userCount,
        total: await User.countDocuments(),
      },
      bets: {
        total: totalBets,
        active: activeBets,
        totalAmount: totalBetAmount[0]?.total || 0,
      },
      revenue: {
        deposits: totalDeposits[0]?.total || 0,
        withdrawals: totalWithdrawals[0]?.total || 0,
        profit: (totalBetAmount[0]?.total || 0) - (totalPayout[0]?.total || 0),
        netRevenue: (totalDeposits[0]?.total || 0) - (totalWithdrawals[0]?.total || 0),
      },
    },
  });
});

/**
 * @route   GET /api/admin/reports/revenue
 * @desc    Get revenue report
 * @access  Admin
 */
exports.getRevenueReport = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;

  const days = parseInt(period) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Daily revenue breakdown
  const revenueByDay = await Transaction.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.date': 1 } },
  ]);

  // Payment method breakdown
  const revenueByPaymentMethod = await Transaction.aggregate([
    {
      $match: {
        type: 'deposit',
        status: 'completed',
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: '$paymentMethod',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      daily: revenueByDay,
      byPaymentMethod: revenueByPaymentMethod,
    },
  });
});

/**
 * @route   GET /api/admin/reports/users
 * @desc    Get users report
 * @access  Admin
 */
exports.getUsersReport = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;

  const days = parseInt(period) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // User registration trend
  const registrationTrend = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // User status breakdown
  const statusBreakdown = await User.aggregate([
    {
      $group: {
        _id: '$accountStatus',
        count: { $sum: 1 },
      },
    },
  ]);

  // KYC status breakdown
  const kycBreakdown = await User.aggregate([
    {
      $group: {
        _id: '$kycStatus',
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      registrationTrend,
      statusBreakdown,
      kycBreakdown,
      total: await User.countDocuments(),
      new: await User.countDocuments({ createdAt: { $gte: startDate } }),
    },
  });
});

// ============================================
// SETTINGS MANAGEMENT
// ============================================

const Settings = require('../models/Settings');

/**
 * @route   GET /api/admin/settings
 * @desc    Get platform settings
 * @access  Admin
 */
exports.getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSettings();

  res.status(200).json({
    success: true,
    data: settings,
  });
});

/**
 * @route   PUT /api/admin/settings
 * @desc    Update platform settings
 * @access  Super Admin
 */
exports.updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ category: 'default' });

  if (!settings) {
    settings = await Settings.create({
      category: 'default',
      ...req.body,
      updatedBy: req.user.id,
    });
  } else {
    settings = await Settings.findOneAndUpdate(
      { category: 'default' },
      {
        ...req.body,
        updatedBy: req.user.id,
      },
      { new: true, runValidators: true }
    );
  }

  res.status(200).json({
    success: true,
    message: 'Settings updated successfully',
    data: settings,
  });
});

// ============================================
// ADMIN LOGS
// ============================================

const AdminLog = require('../models/AdminLog');

/**
 * @route   GET /api/admin/logs/admin-actions
 * @desc    Get admin action logs
 * @access  Super Admin
 */
exports.getAdminLogs = asyncHandler(async (req, res) => {
  const { action, adminId, page = 1, limit = 50, startDate, endDate } = req.query;

  const query = {};
  if (action) {
    query.action = action;
  }
  if (adminId) {
    query.adminId = adminId;
  }
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const logs = await AdminLog.find(query)
    .populate('adminId', 'username email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const count = await AdminLog.countDocuments(query);

  res.status(200).json({
    success: true,
    data: logs,
    pagination: {
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
    },
  });
});

/**
 * @route   GET /api/admin/logs/system
 * @desc    Get system logs
 * @access  Super Admin
 */
exports.getSystemLogs = asyncHandler(async (req, res) => {
  const { level = 'all', page = 1, limit = 100 } = req.query;

  // This is a placeholder - in production, you would read from actual log files
  // or a logging service like Winston, MongoDB logs, etc.
  
  res.status(200).json({
    success: true,
    message: 'System logs feature - integrate with logging service',
    data: {
      logs: [
        {
          timestamp: new Date(),
          level: 'info',
          message: 'Server started successfully',
          source: 'server.js',
        },
        {
          timestamp: new Date(),
          level: 'info',
          message: 'Database connected',
          source: 'config/database.js',
        },
      ],
      pagination: {
        total: 2,
        page: parseInt(page),
        pages: 1,
      },
    },
  });
});

module.exports = exports;
