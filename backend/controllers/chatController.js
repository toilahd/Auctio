import chatService from '../services/chatService.js';
import { getLogger } from '../config/logger.js';

const logger = getLogger('ChatController');

class ChatController {
  /**
   * Send a chat message
   * POST /api/chat/:orderId/messages
   */
  async sendMessage(req, res) {
    /*
      #swagger.summary = 'Send chat message'
      #swagger.description = 'Send a message in order chat between buyer and seller'
      #swagger.security = [{ "bearerAuth": [] }, { "cookieAuth": [] }]
      #swagger.tags = ['Chat']
      #swagger.parameters['orderId'] = {
        in: 'path',
        description: 'Order ID',
        required: true,
        type: 'string'
      }
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Message content',
        required: true,
        schema: {
          content: 'Hello, when can we arrange pickup?'
        }
      }
      #swagger.responses[201] = {
        description: 'Message sent successfully',
        schema: {
          success: true,
          data: { $ref: '#/definitions/ChatMessage' }
        }
      }
      #swagger.responses[400] = {
        description: 'Message content is required',
        schema: { success: false, message: 'Message content is required' }
      }
      #swagger.responses[401] = {
        description: 'Unauthorized',
        schema: { success: false, message: 'Unauthorized' }
      }
    */
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
    /*
      #swagger.summary = 'Get chat messages'
      #swagger.description = 'Get all messages for an order chat conversation'
      #swagger.security = [{ "bearerAuth": [] }, { "cookieAuth": [] }]
      #swagger.tags = ['Chat']
      #swagger.parameters['orderId'] = {
        in: 'path',
        description: 'Order ID',
        required: true,
        type: 'string'
      }
      #swagger.parameters['page'] = {
        in: 'query',
        description: 'Page number',
        required: false,
        type: 'integer',
        default: 1
      }
      #swagger.parameters['limit'] = {
        in: 'query',
        description: 'Messages per page',
        required: false,
        type: 'integer',
        default: 50
      }
      #swagger.responses[200] = {
        description: 'Messages retrieved successfully',
        schema: {
          success: true,
          data: {
            messages: [{ $ref: '#/definitions/ChatMessage' }],
            total: 150,
            page: 1,
            totalPages: 3
          }
        }
      }
      #swagger.responses[401] = {
        description: 'Unauthorized',
        schema: { success: false, message: 'Unauthorized' }
      }
    */
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
    /*
      #swagger.summary = 'Mark messages as read'
      #swagger.description = 'Mark all messages in an order chat as read'
      #swagger.security = [{ "bearerAuth": [] }, { "cookieAuth": [] }]
      #swagger.tags = ['Chat']
      #swagger.parameters['orderId'] = {
        in: 'path',
        description: 'Order ID',
        required: true,
        type: 'string'
      }
      #swagger.responses[200] = {
        description: 'Messages marked as read',
        schema: {
          success: true,
          data: { count: 5 }
        }
      }
      #swagger.responses[401] = {
        description: 'Unauthorized',
        schema: { success: false, message: 'Unauthorized' }
      }
    */
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
    /*
      #swagger.summary = 'Get unread message count'
      #swagger.description = 'Get total count of unread messages for current user'
      #swagger.security = [{ "bearerAuth": [] }, { "cookieAuth": [] }]
      #swagger.tags = ['Chat']
      #swagger.responses[200] = {
        description: 'Unread count retrieved successfully',
        schema: {
          success: true,
          data: { count: 12 }
        }
      }
      #swagger.responses[401] = {
        description: 'Unauthorized',
        schema: { success: false, message: 'Unauthorized' }
      }
    */
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
    /*
      #swagger.summary = 'Get user chats'
      #swagger.description = 'Get all chat conversations for current user with pagination'
      #swagger.security = [{ "bearerAuth": [] }, { "cookieAuth": [] }]
      #swagger.tags = ['Chat']
      #swagger.parameters['page'] = {
        in: 'query',
        description: 'Page number',
        required: false,
        type: 'integer',
        default: 1
      }
      #swagger.parameters['limit'] = {
        in: 'query',
        description: 'Chats per page',
        required: false,
        type: 'integer',
        default: 20
      }
      #swagger.responses[200] = {
        description: 'Chats retrieved successfully',
        schema: {
          success: true,
          data: {
            chats: [{ $ref: '#/definitions/Chat' }],
            total: 30,
            page: 1,
            totalPages: 2
          }
        }
      }
      #swagger.responses[401] = {
        description: 'Unauthorized',
        schema: { success: false, message: 'Unauthorized' }
      }
    */
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

