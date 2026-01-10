// controllers/biddingController.js
// Controller for handling bidding requests

import biddingService from '../services/biddingService.js';
import { getLogger } from '../config/logger.js';
import prisma from '../config/prisma.js';

const logger = getLogger('BiddingController');

class BiddingController {
  async placeBid(req, res) {
    /*
     * POST /api/bids
     * #swagger.tags = ['Bidding']
     * #swagger.summary = 'Place a bid on a product'
     * #swagger.description = 'Place a bid on a product'
     * #swagger.security = [{ "bearerAuth": [] }]
     * #swagger.parameters['body'] = { in: 'body', description: 'Bid data', required: true, schema: { type: 'object', properties: { productId: { type: 'string' }, maxAmount: { type: 'number' } }, required: ['productId', 'maxAmount'] } }
     */
    try {
      const { productId, maxAmount } = req.body;
      const bidderId = req.user.id;

      if (!productId || !maxAmount) {
        return res.status(400).json({
          success: false,
          message: 'ID sản phẩm và số tiền đấu giá là bắt buộc'
        });
      }

      if (isNaN(maxAmount) || Number(maxAmount) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Số tiền đấu giá không hợp lệ'
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
          currentWinnerId: result.winnerId, // Use winnerId from result
          bidCount: result.bidCount,
          autoBidTriggered: result.autoBidTriggered,
          buyNowTriggered: result.buyNowTriggered,
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

      if (error.message.includes('not found') || error.message.includes('Không tìm thấy') ||
          error.message.includes('not active') || error.message.includes('không còn hoạt động') ||
          error.message.includes('expired') || error.message.includes('đã kết thúc') ||
          error.message.includes('not allowed') ||
          error.message.includes('Seller cannot') || error.message.includes('Người bán không thể') ||
          error.message.includes('Already highest') || error.message.includes('đã là người đấu giá cao nhất') ||
          error.message.includes('Auction ended') ||
          error.message.includes('must be at least') || error.message.includes('quá thấp')) {
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

  async getBidHistory(req, res) {
    /*
     * GET /api/bids/product/:productId
     * #swagger.tags = ['Bidding']
     * #swagger.summary = 'Get bid history for a product'
     * #swagger.description = 'Get bid history for a product'
     * #swagger.parameters['productId'] = { in: 'path', description: 'Product ID', required: true, type: 'string' }
     * #swagger.parameters['limit'] = { in: 'query', description: 'Number of records', type: 'integer', default: 20 }
     * #swagger.parameters['offset'] = { in: 'query', description: 'Offset for pagination', type: 'integer', default: 0 }
     */
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
        message: 'Không thể lấy lịch sử đấu giá'
      });
    }
  }

  async getCurrentWinner(req, res) {
    /*
     * GET /api/bids/product/:productId/winner
     * #swagger.tags = ['Bidding']
     * #swagger.summary = 'Get current winning bid for a product'
     * #swagger.description = 'Get current winning bid for a product'
     * #swagger.parameters['productId'] = { in: 'path', description: 'Product ID', required: true, type: 'string' }
     */
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
        message: 'Không thể lấy thông tin người thắng cuộc'
      });
    }
  }

  async canUserBid(req, res) {
    /*
     * GET /api/bids/product/:productId/can-bid
     * #swagger.tags = ['Bidding']
     * #swagger.summary = 'Check if user can bid on product'
     * #swagger.description = 'Check if user can bid on product'
     * #swagger.security = [{ "bearerAuth": [] }]
     * #swagger.parameters['productId'] = { in: 'path', description: 'Product ID', required: true, type: 'string' }
     */
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

