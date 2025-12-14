// config/socket.js
// Socket.IO configuration for real-time bidding updates

import { Server } from 'socket.io';
import { getLogger } from './logger.js';

const logger = getLogger('Socket');

let io = null;

/**
 * Initialize Socket.IO server
 * @param {http.Server} httpServer - HTTP server instance
 * @returns {Server} Socket.IO server instance
 */
export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Join product room to receive updates for a specific product
    socket.on('join:product', (productId) => {
      socket.join(`product:${productId}`);
      logger.info(`Client ${socket.id} joined product room: ${productId}`);

      socket.emit('joined', {
        productId,
        message: 'Successfully joined product room'
      });
    });

    // Leave product room
    socket.on('leave:product', (productId) => {
      socket.leave(`product:${productId}`);
      logger.info(`Client ${socket.id} left product room: ${productId}`);
    });

    // Join user room for personal notifications
    socket.on('join:user', (userId) => {
      socket.join(`user:${userId}`);
      logger.info(`Client ${socket.id} joined user room: ${userId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for client ${socket.id}:`, error);
    });
  });

  logger.info('Socket.IO initialized successfully');
  return io;
};

/**
 * Get the Socket.IO server instance
 * @returns {Server} Socket.IO server instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
};

/**
 * Emit bid update to all clients in a product room
 * @param {string} productId - Product ID
 * @param {Object} data - Bid data to emit
 */
export const emitBidUpdate = (productId, data) => {
  if (!io) {
    logger.warn('Socket.IO not initialized, skipping bid update emit');
    return;
  }

  io.to(`product:${productId}`).emit('bid:placed', {
    productId,
    ...data,
    timestamp: new Date()
  });

  logger.info(`Emitted bid update for product ${productId}`);
};

/**
 * Emit notification to a specific user
 * @param {string} userId - User ID
 * @param {Object} notification - Notification data
 */
export const emitUserNotification = (userId, notification) => {
  if (!io) {
    logger.warn('Socket.IO not initialized, skipping user notification');
    return;
  }

  io.to(`user:${userId}`).emit('notification', {
    ...notification,
    timestamp: new Date()
  });

  logger.info(`Emitted notification to user ${userId}`);
};

/**
 * Emit auction end notification
 * @param {string} productId - Product ID
 * @param {Object} data - Auction end data
 */
export const emitAuctionEnd = (productId, data) => {
  if (!io) {
    logger.warn('Socket.IO not initialized, skipping auction end emit');
    return;
  }

  io.to(`product:${productId}`).emit('auction:ended', {
    productId,
    ...data,
    timestamp: new Date()
  });

  logger.info(`Emitted auction end for product ${productId}`);
};

/**
 * Emit price update
 * @param {string} productId - Product ID
 * @param {Object} data - Price update data
 */
export const emitPriceUpdate = (productId, data) => {
  if (!io) {
    logger.warn('Socket.IO not initialized, skipping price update');
    return;
  }

  io.to(`product:${productId}`).emit('price:updated', {
    productId,
    ...data,
    timestamp: new Date()
  });

  logger.info(`Emitted price update for product ${productId}`);
};

export default {
  initializeSocket,
  getIO,
  emitBidUpdate,
  emitUserNotification,
  emitAuctionEnd,
  emitPriceUpdate
};

