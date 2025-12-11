import prisma from '../config/prisma.js';

export class RatingModel {
  /**
   * Create a new rating
   */
  static async create(ratingData) {
    return prisma.rating.create({
      data: ratingData,
      include: {
        fromUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
        toUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
        order: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get ratings for a user
   */
  static async getForUser(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [ratings, total] = await Promise.all([
      prisma.rating.findMany({
        where: { toUserId: userId },
        include: {
          fromUser: {
            select: {
              id: true,
              fullName: true,
            },
          },
          order: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
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
      prisma.rating.count({ where: { toUserId: userId } }),
    ]);

    return { ratings, total, page, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Get ratings given by a user
   */
  static async getByUser(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [ratings, total] = await Promise.all([
      prisma.rating.findMany({
        where: { fromUserId: userId },
        include: {
          toUser: {
            select: {
              id: true,
              fullName: true,
            },
          },
          order: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
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
      prisma.rating.count({ where: { fromUserId: userId } }),
    ]);

    return { ratings, total, page, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Get ratings for an order
   */
  static async getForOrder(orderId) {
    return prisma.rating.findMany({
      where: { orderId },
      include: {
        fromUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
        toUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  /**
   * Check if user has rated an order
   */
  static async hasUserRatedOrder(orderId, fromUserId) {
    const count = await prisma.rating.count({
      where: {
        orderId,
        fromUserId,
      },
    });
    return count > 0;
  }

  /**
   * Get rating statistics for a user
   */
  static async getUserStats(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        positiveRatings: true,
        negativeRatings: true,
      },
    });

    const totalRatings = user.positiveRatings + user.negativeRatings;
    const positivePercentage = totalRatings > 0
      ? (user.positiveRatings / totalRatings) * 100
      : 0;

    return {
      positiveRatings: user.positiveRatings,
      negativeRatings: user.negativeRatings,
      totalRatings,
      positivePercentage: positivePercentage.toFixed(2),
    };
  }
}

export default RatingModel;

