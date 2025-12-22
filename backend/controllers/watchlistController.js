// controllers/watchlistController.js
import watchlistService from '../services/watchlistService.js';
import { getLogger } from '../config/logger.js';

const logger = getLogger('WatchlistController');

class WatchlistController {
  /**
   * POST /api/watchlist
   * Add product to watchlist
   */
  async addToWatchlist(req, res) {
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

  /**
   * DELETE /api/watchlist/:productId
   * Remove product from watchlist
   */
  async removeFromWatchlist(req, res) {
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

  /**
   * GET /api/watchlist
   * Get user's watchlist
   */
  async getWatchlist(req, res) {
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

  /**
   * GET /api/watchlist/check/:productId
   * Check if product is in watchlist
   */
  async checkWatchlist(req, res) {
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

