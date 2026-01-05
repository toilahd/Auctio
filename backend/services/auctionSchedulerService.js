// services/auctionSchedulerService.js
import prisma from '../config/prisma.js';
import { getLogger } from '../config/logger.js';

const logger = getLogger('AuctionScheduler');

class AuctionSchedulerService {
  /**
   * Close expired auctions
   * Run this periodically (every minute)
   */
  static async closeExpiredAuctions() {
    try {
      const now = new Date();

      // Find all ACTIVE products with endTime < now
      const expiredProducts = await prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          endTime: {
            lt: now
          }
        },
        select: {
          id: true,
          title: true,
          endTime: true,
          currentWinnerId: true,
          currentPrice: true
        }
      });

      if (expiredProducts.length === 0) {
        logger.debug('No expired auctions to close');
        return { closed: 0 };
      }

      logger.info(`Found ${expiredProducts.length} expired auctions to close`);

      // Update all expired products to ENDED
      const result = await prisma.product.updateMany({
        where: {
          id: {
            in: expiredProducts.map(p => p.id)
          }
        },
        data: {
          status: 'ENDED'
        }
      });

      logger.info(`Closed ${result.count} expired auctions`);

      // Log each closed auction
      for (const product of expiredProducts) {
        logger.info(`Closed auction: ${product.id} - "${product.title}" (Winner: ${product.currentWinnerId || 'none'})`);
      }

      return {
        closed: result.count,
        products: expiredProducts
      };
    } catch (error) {
      logger.error('Error closing expired auctions:', error);
      throw error;
    }
  }

  /**
   * Start the scheduler
   * Runs every minute
   */
  static startScheduler() {
    logger.info('Starting auction scheduler...');

    // Run immediately on start
    this.closeExpiredAuctions();

    // Then run every minute
    const intervalId = setInterval(() => {
      this.closeExpiredAuctions();
    }, 60 * 1000); // 60 seconds

    logger.info('Auction scheduler started (runs every 60 seconds)');

    return intervalId;
  }

  /**
   * Stop the scheduler
   */
  static stopScheduler(intervalId) {
    if (intervalId) {
      clearInterval(intervalId);
      logger.info('Auction scheduler stopped');
    }
  }
}

export default AuctionSchedulerService;

