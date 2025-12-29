import sellerService from '../services/sellerService.js';
import questionService from '../services/questionService.js';
import { getLogger } from '../config/logger.js';

const logger = getLogger('SellerController');

class SellerController {
  // ==================== PRODUCT CREATION ====================

  /**
   * Create a new auction product
   * POST /api/seller/products
   */
  async createProduct(req, res) {
    try {
      const sellerId = req.user?.id;

      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const {
        title,
        description,
        images,
        startPrice,
        stepPrice,
        buyNowPrice,
        categoryId,
        autoExtend,
        endTime
      } = req.body;

      // Validation
      if (!title || !description || !images || !startPrice || !stepPrice || !categoryId || !endTime) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      const product = await sellerService.createProduct(sellerId, {
        title,
        description,
        images,
        startPrice: parseFloat(startPrice),
        stepPrice: parseFloat(stepPrice),
        buyNowPrice: buyNowPrice ? parseFloat(buyNowPrice) : null,
        categoryId,
        autoExtend,
        endTime
      });

      return res.status(201).json({
        success: true,
        data: product
      });
    } catch (error) {
      logger.error('Error in createProduct:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to create product'
      });
    }
  }

  // ==================== PRODUCT DESCRIPTION UPDATE ====================

  /**
   * Append description to product
   * PATCH /api/seller/products/:id/description
   */
  async appendDescription(req, res) {
    try {
      const sellerId = req.user?.id;
      const { id } = req.params;
      const { description } = req.body;

      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      if (!description) {
        return res.status(400).json({
          success: false,
          message: 'Description is required'
        });
      }

      const product = await sellerService.appendDescription(sellerId, id, description);

      return res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      logger.error('Error in appendDescription:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update description'
      });
    }
  }

  // ==================== DENY BIDDER ====================

  /**
   * Deny a bidder from bidding on a product
   * POST /api/seller/products/:id/deny-bidder
   */
  async denyBidder(req, res) {
    try {
      const sellerId = req.user?.id;
      const { id } = req.params;
      const { bidderId, reason } = req.body;

      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      if (!bidderId) {
        return res.status(400).json({
          success: false,
          message: 'Bidder ID is required'
        });
      }

      const result = await sellerService.denyBidder(sellerId, id, bidderId, reason);

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error in denyBidder:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to deny bidder'
      });
    }
  }

  // ==================== ANSWER QUESTIONS ====================

  /**
   * Answer a question
   * POST /api/seller/questions/:id/answer
   */
  async answerQuestion(req, res) {
    try {
      const sellerId = req.user?.id;
      const { id } = req.params;
      const { content } = req.body;

      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Answer content is required'
        });
      }

      const answer = await questionService.answerQuestion(id, sellerId, content);

      return res.status(201).json({
        success: true,
        data: answer
      });
    } catch (error) {
      logger.error('Error in answerQuestion:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to answer question'
      });
    }
  }

  // ==================== PRODUCT MANAGEMENT ====================

  /**
   * Get seller's active products
   * GET /api/seller/products/active
   */
  async getActiveProducts(req, res) {
    try {
      const sellerId = req.user?.id;
      const { page = 1, limit = 20 } = req.query;

      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const result = await sellerService.getSellerActiveProducts(
        sellerId,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in getActiveProducts:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get active products'
      });
    }
  }

  /**
   * Get seller's completed products with winners
   * GET /api/seller/products/completed
   */
  async getCompletedProducts(req, res) {
    try {
      const sellerId = req.user?.id;
      const { page = 1, limit = 20 } = req.query;

      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const result = await sellerService.getSellerCompletedProducts(
        sellerId,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in getCompletedProducts:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get completed products'
      });
    }
  }

  // ==================== RATING ====================

  /**
   * Rate a winner
   * POST /api/seller/products/:id/rate-winner
   */
  async rateWinner(req, res) {
    try {
      const sellerId = req.user?.id;
      const { id } = req.params;
      const { rating, comment } = req.body;

      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      if (rating === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Rating is required (+1 or -1)'
        });
      }

      const result = await sellerService.rateWinner(sellerId, id, rating, comment || '');

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error in rateWinner:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to rate winner'
      });
    }
  }

  /**
   * Cancel transaction and auto-rate winner negatively
   * POST /api/seller/products/:id/cancel-transaction
   */
  async cancelTransaction(req, res) {
    try {
      const sellerId = req.user?.id;
      const { id } = req.params;

      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const result = await sellerService.cancelTransaction(sellerId, id);

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error in cancelTransaction:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to cancel transaction'
      });
    }
  }
}

export default new SellerController();

