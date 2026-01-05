// controllers/auctionSchedulerController.js
import AuctionSchedulerService from '../services/auctionSchedulerService.js';
import { getLogger } from '../config/logger.js';

const logger = getLogger('AuctionSchedulerController');

/**
 * Manually trigger closing expired auctions
 * POST /api/admin/close-expired-auctions
 */
export async function closeExpiredAuctions(req, res) {
  try {
    const result = await AuctionSchedulerService.closeExpiredAuctions();

    res.json({
      success: true,
      data: result,
      message: `Đã đóng ${result.closed} phiên đấu giá hết hạn`
    });
  } catch (error) {
    logger.error('Error closing expired auctions:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể đóng phiên đấu giá hết hạn'
    });
  }
}

