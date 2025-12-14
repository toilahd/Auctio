// controllers/biddingController.js
// Controller for handling bidding requests

import biddingService from '../services/biddingService.js';
import { getLogger } from '../config/logger.js';
import prisma from '../config/prisma.js';

const logger = getLogger('BiddingController');

class BiddingController {
  /**
   * Place a bid on a product
   * POST /api/bids
   */
  // controllers/biddingController.js

  async placeBid(req, res) {
    try {
      const { productId, maxAmount } = req.body;
      const bidderId = req.user.id;

      if (!productId || !maxAmount) {
        return res.status(400).json({
          success: false,
          message: 'Product ID and max amount are required'
        });
      }

      if (isNaN(maxAmount) || Number(maxAmount) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid max amount'
        });
      }

      const result = await biddingService.placeBid({
        productId,
        bidderId,
        maxAmount: Number(maxAmount)
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`product:${productId}`).emit('bid:placed', {
          productId,
          currentPrice: result.currentPrice,
          currentWinnerId: result.currentWinnerId,
          bidCount: result.bidCount,
          autoBidTriggered: result.autoBidTriggered,
          timestamp: new Date()
        });
      }

      return res.status(201).json({
        success: true,
        data: result
      });

    } catch (error) {
      logger.error('Error in placeBid:', error);
      console.error('BIDDING ERROR:', error.message);
      console.error('STACK:', error.stack);

      if (error.message.includes('not found') ||
          error.message.includes('not active') ||
          error.message.includes('expired') ||
          error.message.includes('not allowed') ||
          error.message.includes('Seller cannot') ||
          error.message.includes('Already highest') ||
          error.message.includes('Auction ended') ||
          error.message.includes('must be at least')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get bid history for a product
   * GET /api/bids/product/:productId
   */
  async getBidHistory(req, res) {
    try {
      const { productId } = req.params;
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;

      const result = await biddingService.getBidHistory(productId, limit, offset);

      return res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      logger.error('Error in getBidHistory:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get bid history'
      });
    }
  }

  /**
   * Get current winning bid for a product
   * GET /api/bids/product/:productId/winner
   */
  async getCurrentWinner(req, res) {
    try {
      const { productId } = req.params;

      const result = await biddingService.getCurrentWinner(productId);

      return res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      logger.error('Error in getCurrentWinner:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get current winner'
      });
    }
  }

  /**
   * Check if user can bid on product
   * GET /api/bids/product/:productId/can-bid
   */
  async canUserBid(req, res) {
    try {
      const { productId } = req.params;
      const userId = req.user.id;

      const result = await biddingService.canUserBid(productId, userId);

      return res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      logger.error('Error in canUserBid:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to check bid permission'
      });
    }
  }

  /**
   * Helper: Get bid count for a product
   */
  async getBidCount(productId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { bidCount: true }
    });
    return product?.bidCount || 0;
  }
}

export default new BiddingController();

