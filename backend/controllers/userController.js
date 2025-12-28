// controllers/userController.js
import userService from '../services/userService.js';
import { getLogger } from '../config/logger.js';

const logger = getLogger('UserController');

class UserController {
  async getProfile(req, res) {
    /*
     * GET /api/users/profile
     * #swagger.tags = ['Users']
     * #swagger.summary = 'Get current user profile'
     * #swagger.description = 'Get current user profile'
     * #swagger.security = [{ "bearerAuth": [] }]
     */
    try {
      const userId = req.user.id;

      const user = await userService.getUserProfile(userId);

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Error in getProfile:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get profile'
      });
    }
  }

  async updateProfile(req, res) {
    /*
     * PUT /api/users/profile
     * #swagger.tags = ['Users']
     * #swagger.summary = 'Update user profile'
     * #swagger.description = 'Update user profile'
     * #swagger.security = [{ "bearerAuth": [] }]
     * #swagger.parameters['body'] = { in: 'body', description: 'User profile data', required: true, schema: { type: 'object', properties: { email: { type: 'string' }, fullName: { type: 'string' }, address: { type: 'string' }, dateOfBirth: { type: 'string' } } } }
     */
    try {
      const userId = req.user.id;
      const { email, fullName, address, dateOfBirth } = req.body;

      const user = await userService.updateProfile(userId, {
        email,
        fullName,
        address,
        dateOfBirth
      });

      return res.status(200).json({
        success: true,
        data: user,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      logger.error('Error in updateProfile:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update profile'
      });
    }
  }

  async changePassword(req, res) {
    /*
     * POST /api/users/change-password
     * #swagger.tags = ['Users']
     * #swagger.summary = 'Change password'
     * #swagger.description = 'Change password'
     * #swagger.security = [{ "bearerAuth": [] }]
     * #swagger.parameters['body'] = { in: 'body', description: 'Password change data', required: true, schema: { type: 'object', properties: { oldPassword: { type: 'string' }, newPassword: { type: 'string' } }, required: ['oldPassword', 'newPassword'] } }
     */
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Old password and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }

      await userService.changePassword(userId, oldPassword, newPassword);

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      logger.error('Error in changePassword:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to change password'
      });
    }
  }

  async getRatings(req, res) {
    /*
     * GET /api/users/ratings
     * #swagger.tags = ['Users']
     * #swagger.summary = 'Get user ratings'
     * #swagger.description = 'Get user ratings'
     * #swagger.security = [{ "bearerAuth": [] }]
     * #swagger.parameters['page'] = { in: 'query', description: 'Page number', type: 'integer', default: 1 }
     * #swagger.parameters['limit'] = { in: 'query', description: 'Items per page', type: 'integer', default: 20 }
     */
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;

      const result = await userService.getUserRatings(
        userId,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in getRatings:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get ratings'
      });
    }
  }

  async getBiddingProducts(req, res) {
    /*
     * GET /api/users/bidding-products
     * #swagger.tags = ['Users']
     * #swagger.summary = 'Get products user is bidding on'
     * #swagger.description = 'Get products user is bidding on'
     * #swagger.security = [{ "bearerAuth": [] }]
     * #swagger.parameters['page'] = { in: 'query', description: 'Page number', type: 'integer', default: 1 }
     * #swagger.parameters['limit'] = { in: 'query', description: 'Items per page', type: 'integer', default: 20 }
     */
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;

      const result = await userService.getUserBiddingProducts(
        userId,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in getBiddingProducts:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get bidding products'
      });
    }
  }

  async getWonProducts(req, res) {
    /*
     * GET /api/users/won-products
     * #swagger.tags = ['Users']
     * #swagger.summary = 'Get products user has won'
     * #swagger.description = 'Get products user has won'
     * #swagger.security = [{ "bearerAuth": [] }]
     * #swagger.parameters['page'] = { in: 'query', description: 'Page number', type: 'integer', default: 1 }
     * #swagger.parameters['limit'] = { in: 'query', description: 'Items per page', type: 'integer', default: 20 }
     */
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;

      const result = await userService.getUserWonProducts(
        userId,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in getWonProducts:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get won products'
      });
    }
  }

  async rateSeller(req, res) {
    /*
     * POST /api/users/rate-seller
     * #swagger.tags = ['Users']
     * #swagger.summary = 'Rate a seller'
     * #swagger.description = 'Rate a seller'
     * #swagger.security = [{ "bearerAuth": [] }]
     * #swagger.parameters['body'] = { in: 'body', description: 'Rating data', required: true, schema: { type: 'object', properties: { toUserId: { type: 'string' }, type: { type: 'string', enum: ['POSITIVE', 'NEGATIVE'] }, comment: { type: 'string' }, orderId: { type: 'string' } }, required: ['toUserId', 'type'] } }
     */
    try {
      const fromUserId = req.user.id;
      const { toUserId, type, comment, orderId } = req.body;

      if (!toUserId || !type) {
        return res.status(400).json({
          success: false,
          message: 'Seller ID and rating type are required'
        });
      }

      if (!['POSITIVE', 'NEGATIVE'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Rating type must be POSITIVE or NEGATIVE'
        });
      }

      const rating = await userService.rateSeller(
        fromUserId,
        toUserId,
        type,
        comment,
        orderId
      );

      return res.status(201).json({
        success: true,
        data: rating,
        message: 'Rating submitted successfully'
      });
    } catch (error) {
      logger.error('Error in rateSeller:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to submit rating'
      });
    }
  }

  async requestSellerUpgrade(req, res) {
    /*
     * POST /api/users/request-seller-upgrade
     * #swagger.tags = ['Users']
     * #swagger.summary = 'Request upgrade to seller'
     * #swagger.description = 'Request upgrade to seller'
     * #swagger.security = [{ "bearerAuth": [] }]
     */
    try {
      const userId = req.user.id;

      const result = await userService.requestSellerUpgrade(userId);

      return res.status(200).json({
        success: true,
        data: result,
        message: 'Seller upgrade request submitted. Admin will review within 7 days.'
      });
    } catch (error) {
      logger.error('Error in requestSellerUpgrade:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to request seller upgrade'
      });
    }
  }
}

export default new UserController();

