/**
 * Casino Controller
 * Now connected to GSC+ Seamless Wallet API for real game data
 */

const { asyncHandler } = require('../middleware/error.middleware');
const gscService = require('../services/gsc.service');
const GscGame = require('../models/GscGame');
const GscSession = require('../models/GscSession');
const User = require('../models/User');
const gscConfig = require('../config/gsc');
const { md5 } = require('../utils/gsc-signature');

/**
 * @desc    Get all casino games (from local DB, synced from GSC+)
 * @route   GET /api/casino/games
 * @access  Public
 *
 * Uses aggregation to deduplicate games that appear for multiple currencies.
 * For each unique gameCode+productCode combination, returns one document.
 */
module.exports.getGames = asyncHandler(async (req, res) => {
  const {
    category,
    gameType,
    productCode,
    search,
    page = 1,
    limit = 50,
    sort = '-isPopular',
  } = req.query;

  const matchStage = { status: 'active' };

  if (category) matchStage.category = category;
  if (gameType) matchStage.gameType = gameType;
  if (productCode) matchStage.productCode = parseInt(productCode, 10);
  if (search) {
    matchStage.$or = [
      { gameName: { $regex: search, $options: 'i' } },
      { gameCode: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const lim = parseInt(limit, 10);

  // Aggregation pipeline: group by gameCode+productCode to deduplicate
  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: { gameCode: '$gameCode', productCode: '$productCode' },
        doc: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$doc' } },
  ];

  // Parse sort
  let sortStage = { isPopular: -1 };
  if (sort) {
    const sortObj = {};
    const parts = sort.split(' ');
    for (const part of parts) {
      if (part.startsWith('-')) {
        sortObj[part.slice(1)] = -1;
      } else {
        sortObj[part] = 1;
      }
    }
    sortStage = sortObj;
  }

  // Count unique games
  const countPipeline = [...pipeline, { $count: 'total' }];
  const countResult = await GscGame.aggregate(countPipeline);
  const total = countResult.length > 0 ? countResult[0].total : 0;

  // Get paginated unique games
  const games = await GscGame.aggregate([
    ...pipeline,
    { $sort: sortStage },
    { $skip: skip },
    { $limit: lim },
  ]);

  res.status(200).json({
    success: true,
    data: games,
    pagination: {
      page: parseInt(page, 10),
      limit: lim,
      total,
      pages: Math.ceil(total / lim),
    },
  });
});

/**
 * @desc    Get game by ID
 * @route   GET /api/casino/games/:id
 * @access  Public
 */
module.exports.getGameById = asyncHandler(async (req, res) => {
  const game = await GscGame.findById(req.params.id).lean();

  if (!game) {
    return res.status(404).json({ success: false, message: 'Game not found' });
  }

  res.status(200).json({ success: true, data: game });
});

/**
 * @desc    Get games by category
 * @route   GET /api/casino/games/category/:category
 * @access  Public
 */
module.exports.getGamesByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const lim = parseInt(limit, 10);

  const matchStage = { category, status: 'active' };

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: { gameCode: '$gameCode', productCode: '$productCode' },
        doc: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$doc' } },
  ];

  const countResult = await GscGame.aggregate([...pipeline, { $count: 'total' }]);
  const total = countResult.length > 0 ? countResult[0].total : 0;

  const games = await GscGame.aggregate([
    ...pipeline,
    { $sort: { isPopular: -1, isFeatured: -1, displayOrder: 1 } },
    { $skip: skip },
    { $limit: lim },
  ]);

  res.status(200).json({
    success: true,
    data: games,
    pagination: {
      page: parseInt(page, 10),
      limit: lim,
      total,
      pages: Math.ceil(total / lim),
    },
  });
});

/**
 * @desc    Get games by provider (product code)
 * @route   GET /api/casino/games/provider/:provider
 * @access  Public
 */
module.exports.getGamesByProvider = asyncHandler(async (req, res) => {
  const { provider } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const lim = parseInt(limit, 10);

  const matchStage = {
    $or: [
      { productCode: parseInt(provider, 10) || 0 },
      { productName: { $regex: provider, $options: 'i' } },
    ],
    status: 'active',
  };

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: { gameCode: '$gameCode', productCode: '$productCode' },
        doc: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$doc' } },
  ];

  const countResult = await GscGame.aggregate([...pipeline, { $count: 'total' }]);
  const total = countResult.length > 0 ? countResult[0].total : 0;

  const games = await GscGame.aggregate([
    ...pipeline,
    { $sort: { isPopular: -1, displayOrder: 1 } },
    { $skip: skip },
    { $limit: lim },
  ]);

  res.status(200).json({
    success: true,
    data: games,
    pagination: {
      page: parseInt(page, 10),
      limit: lim,
      total,
      pages: Math.ceil(total / lim),
    },
  });
});

/**
 * @desc    Launch a real game via GSC+ API
 * @route   POST /api/casino/games/:id/launch
 * @access  Private (logged in users only)
 */
module.exports.launchGame = asyncHandler(async (req, res) => {
  const game = await GscGame.findById(req.params.id);

  if (!game) {
    return res.status(404).json({ success: false, message: 'Game not found' });
  }

  if (game.status !== 'active') {
    return res.status(400).json({ success: false, message: 'Game is currently unavailable' });
  }

  const user = await User.findById(req.user.id).select('username wallet preferences');

  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' });
  }

  // Determine platform from user agent
  const userAgent = req.headers['user-agent'] || '';
  let platform = 'WEB';
  if (/mobile|android|iphone|ipad/i.test(userAgent)) {
    platform = 'MOBILE';
  }

  // Get language code
  const langMap = gscConfig.languageCodes;
  const userLang = user.preferences?.language || 'en';
  const languageCode = langMap[userLang] || 0;

  // Generate password hash for GSC+ (MD5 of a consistent value)
  const passwordHash = md5(`${user.username}_${gscConfig.operatorCode}`);

  try {
    // Get the correct operator-assigned currency for this product
    // GSC+ assigns a specific currency per product per operator - 
    // this is NOT the same as the game's supportCurrency field
    const operatorCurrency = await gscService.getProductCurrency(game.productCode, game.gameType);
    console.log(`[Casino] Launching game ${game.gameName} (${game.gameCode}) with currency: ${operatorCurrency} (product: ${game.productCode}, type: ${game.gameType})`);

    const result = await gscService.launchGame({
      memberAccount: user.username,
      password: passwordHash,
      nickname: user.username,
      currency: operatorCurrency,
      gameCode: game.gameCode,
      productCode: game.productCode,
      gameType: game.gameType,
      ip: req.ip || req.connection.remoteAddress || '127.0.0.1',
      platform,
      lobbyUrl: `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/casino`,
      languageCode,
    });

    // Create session record
    const gameSession = new GscSession({
      user: user._id,
      memberAccount: user.username,
      productCode: game.productCode,
      gameCode: game.gameCode,
      gameType: game.gameType,
      gameName: game.gameName,
      gameUrl: result.url,
      platform,
      balanceStart: user.wallet.balance || 0,
      ip: req.ip || req.connection.remoteAddress,
      userAgent,
    });
    await gameSession.save();

    // Update game play count
    await GscGame.findByIdAndUpdate(game._id, {
      $inc: { 'stats.totalPlays': 1 },
    });

    res.status(200).json({
      success: true,
      data: {
        gameUrl: result.url,
        content: result.content || null,
        sessionId: gameSession._id,
      },
    });
  } catch (error) {
    console.error('[Casino] Game launch error:', error.message);
    
    // Provide user-friendly error messages for known GSC+ errors
    let userMessage = 'Failed to launch game. Please try again.';
    if (error.message.includes('record not found')) {
      userMessage = 'This game is currently unavailable. Please try another game.';
    } else if (error.message.includes('PreAuth failed') || error.message.includes('auth fail')) {
      userMessage = 'This game provider is temporarily unavailable. Please try another game.';
    } else if (error.message.includes('unsupported game')) {
      userMessage = 'This game is not available in your region. Please try another game.';
    } else if (error.message.includes('non-JSON response') || error.message.includes('504')) {
      userMessage = 'Game provider is not responding. Please try again later.';
    }

    res.status(500).json({
      success: false,
      message: userMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @desc    Launch game in demo mode (no real money)
 * @route   POST /api/casino/games/:id/demo
 * @access  Public
 */
module.exports.launchDemo = asyncHandler(async (req, res) => {
  const game = await GscGame.findById(req.params.id);

  if (!game) {
    return res.status(404).json({ success: false, message: 'Game not found' });
  }

  const passwordHash = md5(`demo_user_${gscConfig.operatorCode}`);

  try {
    // Get the correct operator-assigned currency for this product
    const operatorCurrency = await gscService.getProductCurrency(game.productCode, game.gameType);

    const result = await gscService.launchGame({
      memberAccount: 'demo_player',
      password: passwordHash,
      nickname: 'Demo Player',
      currency: operatorCurrency,
      gameCode: game.gameCode,
      productCode: game.productCode,
      gameType: game.gameType,
      ip: req.ip || '127.0.0.1',
      platform: 'WEB',
      lobbyUrl: `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/casino`,
    });

    res.status(200).json({
      success: true,
      data: {
        gameUrl: result.url,
        content: result.content || null,
      },
    });
  } catch (error) {
    console.error('[Casino] Demo launch error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Demo mode is not available for this game.',
    });
  }
});

/**
 * @desc    Launch Super Lobby
 * @route   POST /api/casino/super-lobby
 * @access  Private
 */
module.exports.launchSuperLobby = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('username wallet preferences');

  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' });
  }

  const { type = 0 } = req.body; // 0 = Super Lobby, 1 = Aurora Live

  try {
    const result = await gscService.launchSuperLobby({
      memberAccount: user.username,
      nickname: user.username,
      currency: user.wallet?.currency || gscConfig.defaultCurrency,
      platform: 'WEB',
      type,
      lobbyUrl: `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/casino`,
    });

    res.status(200).json({
      success: true,
      data: { lobbyUrl: result.url },
    });
  } catch (error) {
    console.error('[Casino] Super Lobby error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to launch game lobby.',
    });
  }
});

/**
 * @desc    Get user's game sessions
 * @route   GET /api/casino/sessions
 * @access  Private
 */
module.exports.getSessions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const query = { user: req.user.id };
  if (status) query.status = status;

  const [sessions, total] = await Promise.all([
    GscSession.find(query)
      .sort('-startedAt')
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean(),
    GscSession.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: sessions,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / parseInt(limit, 10)),
    },
  });
});

/**
 * @desc    Get session by ID
 * @route   GET /api/casino/sessions/:id
 * @access  Private
 */
module.exports.getSessionById = asyncHandler(async (req, res) => {
  const session = await GscSession.findOne({
    _id: req.params.id,
    user: req.user.id,
  }).lean();

  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  res.status(200).json({ success: true, data: session });
});

/**
 * @desc    End a game session
 * @route   POST /api/casino/sessions/:id/end
 * @access  Private
 */
module.exports.endSession = asyncHandler(async (req, res) => {
  const gameSession = await GscSession.findOne({
    _id: req.params.id,
    user: req.user.id,
    status: 'active',
  });

  if (!gameSession) {
    return res.status(404).json({ success: false, message: 'Active session not found' });
  }

  const user = await User.findById(req.user.id).select('wallet');

  gameSession.status = 'completed';
  gameSession.endedAt = new Date();
  gameSession.balanceEnd = user.wallet.balance || 0;
  gameSession.stats.netResult = (user.wallet.balance || 0) - (gameSession.balanceStart || 0);
  await gameSession.save();

  res.status(200).json({ success: true, message: 'Session ended', data: gameSession });
});

/**
 * @desc    Get popular games
 * @route   GET /api/casino/popular
 * @access  Public
 */
module.exports.getPopularGames = asyncHandler(async (req, res) => {
  const games = await GscGame.aggregate([
    { $match: { status: 'active', isPopular: true } },
    {
      $group: {
        _id: { gameCode: '$gameCode', productCode: '$productCode' },
        doc: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$doc' } },
    { $sort: { 'stats.totalPlays': -1 } },
    { $limit: 20 },
  ]);

  res.status(200).json({ success: true, data: games });
});

/**
 * @desc    Get featured games
 * @route   GET /api/casino/featured
 * @access  Public
 */
module.exports.getFeaturedGames = asyncHandler(async (req, res) => {
  const games = await GscGame.aggregate([
    { $match: { status: 'active', isFeatured: true } },
    {
      $group: {
        _id: { gameCode: '$gameCode', productCode: '$productCode' },
        doc: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$doc' } },
    { $sort: { displayOrder: 1 } },
    { $limit: 20 },
  ]);

  res.status(200).json({ success: true, data: games });
});

/**
 * @desc    Get new games
 * @route   GET /api/casino/new
 * @access  Public
 */
module.exports.getNewGames = asyncHandler(async (req, res) => {
  const games = await GscGame.aggregate([
    { $match: { status: 'active', isNew: true } },
    {
      $group: {
        _id: { gameCode: '$gameCode', productCode: '$productCode' },
        doc: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$doc' } },
    { $sort: { createdAt: -1 } },
    { $limit: 20 },
  ]);

  res.status(200).json({ success: true, data: games });
});

/**
 * @desc    Get all available providers/products
 * @route   GET /api/casino/providers
 * @access  Public
 */
module.exports.getProviders = asyncHandler(async (req, res) => {
  try {
    const providers = await GscGame.aggregate([
      { $match: { status: 'active' } },
      // First deduplicate games
      {
        $group: {
          _id: { gameCode: '$gameCode', productCode: '$productCode' },
          productName: { $first: '$productName' },
          productCode: { $first: '$productCode' },
          gameType: { $first: '$gameType' },
          category: { $first: '$category' },
        },
      },
      // Then group by provider
      {
        $group: {
          _id: '$productCode',
          productName: { $first: '$productName' },
          productCode: { $first: '$productCode' },
          gameCount: { $sum: 1 },
          gameTypes: { $addToSet: '$gameType' },
          categories: { $addToSet: '$category' },
        },
      },
      { $sort: { gameCount: -1 } },
    ]);

    res.status(200).json({ success: true, data: providers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get providers' });
  }
});

/**
 * @desc    Get all game categories with counts
 * @route   GET /api/casino/categories
 * @access  Public
 */
module.exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await GscGame.aggregate([
    { $match: { status: 'active' } },
    // First deduplicate games
    {
      $group: {
        _id: { gameCode: '$gameCode', productCode: '$productCode' },
        category: { $first: '$category' },
      },
    },
    // Then count by category
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const categoryList = categories.map(c => ({
    id: c._id,
    name: c._id.charAt(0).toUpperCase() + c._id.slice(1),
    count: c.count,
  }));

  res.status(200).json({ success: true, data: categoryList });
});

/**
 * @desc    Sync games from GSC+ (Admin only)
 * @route   POST /api/casino/sync-games
 * @access  Admin
 */
module.exports.syncGames = asyncHandler(async (req, res) => {
  const { productCode } = req.body;

  try {
    let products;

    if (productCode) {
      products = [{ product_code: productCode }];
    } else {
      const productList = await gscService.getProductList();
      products = Array.isArray(productList) ? productList : [];
    }

    let totalSynced = 0;
    let totalUpdated = 0;
    const errors = [];

    for (const product of products) {
      try {
        const pCode = product.product_code;
        let offset = 0;
        let hasMore = true;

        while (hasMore) {
          const result = await gscService.getGameList({
            productCode: pCode,
            offset,
            size: 100,
          });

          const games = result.provider_games || [];

          for (const game of games) {
            const category = gscConfig.gameTypeToCategory[game.game_type] || 'other';

            const existingGame = await GscGame.findOne({
              gameCode: game.game_code,
              productCode: game.product_code,
              supportCurrency: game.support_currency,
            });

            await GscGame.findOneAndUpdate(
              {
                gameCode: game.game_code,
                productCode: game.product_code,
                supportCurrency: game.support_currency,
              },
              {
                gameName: game.game_name,
                productId: game.product_id,
                productCode: game.product_code,
                productName: product.product_name || product.provider,
                gameType: game.game_type,
                category,
                imageUrl: game.image_url,
                langName: game.lang_name || {},
                langIcon: game.lang_icon || {},
                supportCurrency: game.support_currency,
                gscStatus: game.status,
                allowFreeRound: game.allow_free_round || false,
                gscCreatedAt: game.created_at,
              },
              { upsert: true, new: true }
            );

            if (!existingGame) {
              totalSynced++;
            } else {
              totalUpdated++;
            }
          }

          const pagination = result.pagination;
          if (pagination && (offset + games.length) < parseInt(pagination.total, 10)) {
            offset += games.length;
          } else {
            hasMore = false;
          }
        }
      } catch (err) {
        errors.push({ productCode: product.product_code, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Synced ${totalSynced} new games, updated ${totalUpdated} existing games`,
      data: { totalSynced, totalUpdated, errors },
    });
  } catch (error) {
    console.error('[Casino Sync] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to sync games from GSC+',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @desc    Get GSC+ wallet balance (Admin)
 * @route   GET /api/casino/wallet-balance
 * @access  Admin
 */
module.exports.getGscWalletBalance = asyncHandler(async (req, res) => {
  try {
    const result = await gscService.getWalletBalance();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get wallet balance' });
  }
});

/**
 * @desc    Get available products from GSC+ (Admin)
 * @route   GET /api/casino/products
 * @access  Admin
 */
module.exports.getProducts = asyncHandler(async (req, res) => {
  try {
    const result = await gscService.getProductList();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get products' });
  }
});
