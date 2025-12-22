// controllers/userController.js
import userService from '../services/userService.js';
import { getLogger } from '../config/logger.js';

const logger = getLogger('UserController');

class UserController {
  /**
   * GET /api/users/profile
   * Get current user profile
   */
  async getProfile(req, res) {
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

  /**
   * PUT /api/users/profile
   * Update user profile
   */
  async updateProfile(req, res) {
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

  /**
   * POST /api/users/change-password
   * Change password
   */
  async changePassword(req, res) {
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

  /**
   * GET /api/users/ratings
   * Get user ratings
   */
  async getRatings(req, res) {
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

  /**
   * GET /api/users/bidding-products
   * Get products user is bidding on
   */
  async getBiddingProducts(req, res) {
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

  /**
   * GET /api/users/won-products
   * Get products user has won
   */
  async getWonProducts(req, res) {
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

  /**
   * POST /api/users/rate-seller
   * Rate a seller
   */
  async rateSeller(req, res) {
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

  /**
   * POST /api/users/request-seller-upgrade
   * Request upgrade to seller
   */
  async requestSellerUpgrade(req, res) {
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

