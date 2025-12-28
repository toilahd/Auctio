// controllers/watchlistController.js
import watchlistService from '../services/watchlistService.js';
import { getLogger } from '../config/logger.js';

const logger = getLogger('WatchlistController');

class WatchlistController {
  async addToWatchlist(req, res) {
    /*
     * POST /api/watchlist
     * #swagger.tags = ['Watchlist']
     * #swagger.summary = 'Add product to watchlist'
     * #swagger.description = 'Add product to watchlist'
     * #swagger.security = [{ "bearerAuth": [] }]
     * #swagger.parameters['body'] = { in: 'body', description: 'Product data', required: true, schema: { type: 'object', properties: { productId: { type: 'string' } }, required: ['productId'] } }
     */
    try {
      const { productId } = req.body;
      const userId = req.user.id;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required'
        });
      }

      const item = await watchlistService.addToWatchlist(userId, productId);

      return res.status(201).json({
        success: true,
        data: item,
        message: 'Product added to watchlist'
      });
    } catch (error) {
      logger.error('Error in addToWatchlist:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to add to watchlist'
      });
    }
  }

  async removeFromWatchlist(req, res) {
    /*
     * DELETE /api/watchlist/:productId
     * #swagger.tags = ['Watchlist']
     * #swagger.summary = 'Remove product from watchlist'
     * #swagger.description = 'Remove product from watchlist'
     * #swagger.security = [{ "bearerAuth": [] }]
     * #swagger.parameters['productId'] = { in: 'path', description: 'Product ID', required: true, type: 'string' }
     */
    try {
      const { productId } = req.params;
      const userId = req.user.id;

      await watchlistService.removeFromWatchlist(userId, productId);

      return res.status(200).json({
        success: true,
        message: 'Product removed from watchlist'
      });
    } catch (error) {
      logger.error('Error in removeFromWatchlist:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to remove from watchlist'
      });
    }
  }

  async getWatchlist(req, res) {
    /*
     * GET /api/watchlist
     * #swagger.tags = ['Watchlist']
     * #swagger.summary = 'Get user watchlist'
     * #swagger.description = 'Get user watchlist'
     * #swagger.security = [{ "bearerAuth": [] }]
     * #swagger.parameters['page'] = { in: 'query', description: 'Page number', type: 'integer', default: 1 }
     * #swagger.parameters['limit'] = { in: 'query', description: 'Items per page', type: 'integer', default: 20 }
     */
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;

      const result = await watchlistService.getUserWatchlist(
        userId,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in getWatchlist:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get watchlist'
      });
    }
  }

  async checkWatchlist(req, res) {
    /*
     * GET /api/watchlist/check/:productId
     * #swagger.tags = ['Watchlist']
     * #swagger.summary = 'Check if product is in watchlist'
     * #swagger.description = 'Check if product is in watchlist'
     * #swagger.security = [{ "bearerAuth": [] }]
     * #swagger.parameters['productId'] = { in: 'path', description: 'Product ID', required: true, type: 'string' }
     */
    try {
      const { productId } = req.params;
      const userId = req.user.id;

      const inWatchlist = await watchlistService.isInWatchlist(userId, productId);

      return res.status(200).json({
        success: true,
        data: { inWatchlist }
      });
    } catch (error) {
      logger.error('Error in checkWatchlist:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to check watchlist'
      });
    }
  }
}

export default new WatchlistController();

