// services/watchlistService.js
import prisma from '../config/prisma.js';
import { getLogger } from '../config/logger.js';

const logger = getLogger('WatchlistService');

class WatchlistService {
  /**
   * Add product to watchlist
   */
  async addToWatchlist(userId, productId) {
    try {
      // Check if product exists and is active
      const product = await prisma.product.findFirst({
        where: {
          id: productId,
          status: 'ACTIVE'
        }
      });

      if (!product) {
        throw new Error('Product not found or not active');
      }

      // Check if already in watchlist
      const existing = await prisma.watchList.findUnique({
        where: {
          userId_productId: {
            userId,
            productId
          }
        }
      });

      if (existing) {
        throw new Error('Product already in watchlist');
      }

      const watchlistItem = await prisma.watchList.create({
        data: {
          userId,
          productId
        },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              images: true,
              currentPrice: true,
              endTime: true,
              status: true
            }
          }
        }
      });

      return watchlistItem;
    } catch (error) {
      logger.error('Error adding to watchlist:', error);
      throw error;
    }
  }

  /**
   * Remove product from watchlist
   */
  async removeFromWatchlist(userId, productId) {
    try {
      const deleted = await prisma.watchList.deleteMany({
        where: {
          userId,
          productId
        }
      });

      if (deleted.count === 0) {
        throw new Error('Product not in watchlist');
      }

      return { success: true };
    } catch (error) {
      logger.error('Error removing from watchlist:', error);
      throw error;
    }
  }

  /**
   * Get user's watchlist
   */
  async getUserWatchlist(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        prisma.watchList.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            product: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true
                  }
                },
                currentWinner: {
                  select: {
                    id: true,
                    fullName: true
                  }
                },
                _count: {
                  select: {
                    bids: true
                  }
                }
              }
            }
          }
        }),
        prisma.watchList.count({ where: { userId } })
      ]);

      const products = items.map(item => ({
        ...item.product,
        bidCount: item.product._count.bids,
        watchlistId: item.id,
        addedAt: item.createdAt
      }));

      return {
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + items.length < total
        }
      };
    } catch (error) {
      logger.error('Error getting watchlist:', error);
      throw error;
    }
  }

  /**
   * Check if product is in user's watchlist
   */
  async isInWatchlist(userId, productId) {
    try {
      const item = await prisma.watchList.findUnique({
        where: {
          userId_productId: {
            userId,
            productId
          }
        }
      });

      return !!item;
    } catch (error) {
      logger.error('Error checking watchlist:', error);
      throw error;
    }
  }
}

export default new WatchlistService();

