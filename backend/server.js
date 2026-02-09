/**
 * CrickBet Backend Server
 * Main entry point for the Express application
 */

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const bodyParser = require('body-parser');

// Load environment variables
require('dotenv').config();

// Import configurations
const connectDB = require('./config/db');
const corsOptions = require('./config/cors');
const { initializeSocket } = require('./sockets');

// Import middleware
const errorHandler = require('./middleware/error.middleware');
const rateLimiter = require('./middleware/rateLimit.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const betRoutes = require('./routes/bet.routes');
const marketRoutes = require('./routes/market.routes');
const walletRoutes = require('./routes/wallet.routes');
const kycRoutes = require('./routes/kyc.routes');
const adminRoutes = require('./routes/admin.routes');
const casinoRoutes = require('./routes/casino.routes');
const referralRoutes = require('./routes/referral.routes');
const affiliateRoutes = require('./routes/affiliate.routes');
const promotionRoutes = require('./routes/promotion.routes');
const lotteryRoutes = require('./routes/lottery.routes');
const sportsRoutes = require('./routes/sports.routes');
const crashRoutes = require('./routes/crash.routes');
const slotsRoutes = require('./routes/slots.routes');
const oddsFeedRoutes = require('./routes/odds-feed.routes');
const paymentRoutes = require('./routes/payment.routes');
const winnerBoardRoutes = require('./routes/winnerBoard.routes');
const gscCallbackRoutes = require('./routes/gsc-callback.routes');

// Initialize Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet());

// Enable CORS
app.use(cors(corsOptions));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Rate limiting
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bets', betRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/casino', casinoRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/lottery', lotteryRoutes);
app.use('/api/sports', sportsRoutes);
app.use('/api/crash', crashRoutes);
app.use('/api/slots', slotsRoutes);
app.use('/api/odds-feed', oddsFeedRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/winner-board', winnerBoardRoutes);

// GSC+ Seamless Wallet Callback Routes (called by GSC+ platform, no JWT auth)
app.use('/v1/api/seamless', gscCallbackRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// Global Error Handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🏏 CrickBet Backend Server                              ║
  ║                                                           ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}                            ║
  ║   Port: ${PORT}                                            ║
  ║   API URL: http://localhost:${PORT}/api                    ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

module.exports = { app, server };
