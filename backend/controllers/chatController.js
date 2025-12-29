import chatService from '../services/chatService.js';
import { getLogger } from '../config/logger.js';

const logger = getLogger('ChatController');

class ChatController {
  /**
   * Send a chat message
   * POST /api/chat/:orderId/messages
   */
  async sendMessage(req, res) {
    try {
      const userId = req.user?.id;
      const { orderId } = req.params;
      const { content } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Message content is required'
        });
      }

      const message = await chatService.sendMessage(orderId, userId, content.trim());

      return res.status(201).json({
        success: true,
        data: message
      });
    } catch (error) {
      logger.error('Error in sendMessage:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to send message'
      });
    }
  }

  /**
   * Get messages for an order chat
   * GET /api/chat/:orderId/messages
   */
  async getMessages(req, res) {
    try {
      const userId = req.user?.id;
      const { orderId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const result = await chatService.getMessages(
        orderId,
        userId,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in getMessages:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to get messages'
      });
    }
  }

  /**
   * Mark messages as read
   * POST /api/chat/:orderId/read
   */
  async markAsRead(req, res) {
    try {
      const userId = req.user?.id;
      const { orderId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const result = await chatService.markAsRead(orderId, userId);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in markAsRead:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to mark messages as read'
      });
    }
  }

  /**
   * Get unread message count
   * GET /api/chat/unread
   */
  async getUnreadCount(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const result = await chatService.getUnreadCount(userId);

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in getUnreadCount:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get unread count'
      });
    }
  }

  /**
   * Get all chats for current user
   * GET /api/chat
   */
  async getUserChats(req, res) {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 20 } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const result = await chatService.getUserChats(
        userId,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in getUserChats:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get chats'
      });
    }
  }
}

export default new ChatController();

