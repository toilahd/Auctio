import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class WatchListModel {
  /**
   * Add product to watchlist
   */
  static async add(userId, productId) {
    return prisma.watchList.create({
      data: {
        userId,
        productId,
      },
      include: {
        product: {
          include: {
            category: true,
            seller: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Remove product from watchlist
   */
  static async remove(userId, productId) {
    return prisma.watchList.deleteMany({
      where: {
        userId,
        productId,
      },
    });
  }

  /**
   * Get user's watchlist
   */
  static async getByUser(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.watchList.findMany({
        where: { userId },
        include: {
          product: {
            include: {
              category: true,
              seller: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
              currentWinner: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.watchList.count({ where: { userId } }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Check if product is in user's watchlist
   */
  static async isInWatchlist(userId, productId) {
    const count = await prisma.watchList.count({
      where: {
        userId,
        productId,
      },
    });
    return count > 0;
  }

  /**
   * Get watchlist count for user
   */
  static async getCount(userId) {
    return prisma.watchList.count({
      where: { userId },
    });
  }

  /**
   * Get all users watching a product
   */
  static async getWatchersForProduct(productId) {
    return prisma.watchList.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }
}

export default WatchListModel;

