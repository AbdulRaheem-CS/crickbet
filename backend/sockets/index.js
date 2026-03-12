/**
 * Socket.io Server
 * WebSocket server for real-time updates
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const oddsFeedService = require('../services/odds-feed.service');
const { initializeBettingSocket } = require('./betting.socket');

let io;

/**
 * Initialize Socket.io server
 */
exports.initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["*"]
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        // Allow anonymous connections for public data
        socket.userId = null;
        return next();
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.username = user.username;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} | User: ${socket.username || 'Anonymous'}`);

    // Join user-specific room if authenticated
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Admin joins admin chat room for real-time chat notifications
    socket.on('admin:joinChat', () => {
      socket.join('admin:chat');
      console.log(`Socket ${socket.id} joined admin:chat room`);
    });

    // Initialize betting socket handlers
    initializeBettingSocket(socket);

    // Handle odds feed WebSocket subscription
    oddsFeedService.handleWebSocketFeed(socket);

    // Handle market subscription
    socket.on('subscribe:market', (marketId) => {
      socket.join(`market:${marketId}`);
      console.log(`Socket ${socket.id} subscribed to market ${marketId}`);
    });

    // Handle market unsubscription
    socket.on('unsubscribe:market', (marketId) => {
      socket.leave(`market:${marketId}`);
      console.log(`Socket ${socket.id} unsubscribed from market ${marketId}`);
    });

    // Handle sport subscription
    socket.on('subscribe:sport', (sportId) => {
      socket.join(`sport:${sportId}`);
    });

    // Handle event subscription (for live scores)
    socket.on('subscribe:event', (eventId) => {
      socket.join(`event:${eventId}`);
      console.log(`Socket ${socket.id} subscribed to event ${eventId}`);
    });

    // Handle event unsubscription
    socket.on('unsubscribe:event', (eventId) => {
      socket.leave(`event:${eventId}`);
      console.log(`Socket ${socket.id} unsubscribed from event ${eventId}`);
    });

    // Handle crash game subscription
    socket.on('subscribe:crash', () => {
      socket.join('crash:game');
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  console.log('✅ Socket.io server initialized');

  return io;
};

/**
 * Get io instance
 */
exports.getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

/**
 * Emit to specific user
 */
exports.emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

/**
 * Emit to market subscribers
 */
exports.emitToMarket = (marketId, event, data) => {
  if (io) {
    io.to(`market:${marketId}`).emit(event, data);
  }
};

/**
 * Emit to all connected clients
 */
exports.emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

/**
 * Get connected clients count
 */
exports.getConnectedClientsCount = () => {
  if (io) {
    return io.engine.clientsCount;
  }
  return 0;
};
