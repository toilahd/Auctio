import express from 'express';
import chatController from '../controllers/chatController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import getUserFromJwt from '../utils/getUserFromJwtMiddleware.js';
import { validate, chatSchemas, commonSchemas } from '../middlewares/validationMiddleware.js';

const router = express.Router();

// All chat routes require authentication
// router.use(authenticate);
router.use(getUserFromJwt);

/**
 * GET /api/chat
 * Get all chats for the current user
 * Query params: page, limit
 */
router.get('/', validate({ query: commonSchemas.pagination }), chatController.getUserChats);

/**
 * GET /api/chat/unread
 * Get unread message count for current user
 */
router.get('/unread', chatController.getUnreadCount);

/**
 * GET /api/chat/:orderId/messages
 * Get messages for a specific order chat
 * Query params: page, limit
 */
router.get('/:orderId/messages', validate(chatSchemas.getMessages), chatController.getMessages);

/**
 * POST /api/chat/:orderId/messages
 * Send a message in an order chat
 * Body: { content: string }
 */
router.post('/:orderId/messages', validate(chatSchemas.sendMessage), chatController.sendMessage);

/**
 * POST /api/chat/:orderId/read
 * Mark all messages in a chat as read
 */
router.post('/:orderId/read', validate(chatSchemas.markAsRead), chatController.markAsRead);

export default router;

