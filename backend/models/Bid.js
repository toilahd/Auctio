import prisma from '../config/prisma.js';

export class BidModel {
  /**
   * Create a new bid
   */
  static async create(bidData) {
    return prisma.bid.create({
      data: bidData,
      include: {
        bidder: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            currentPrice: true,
            stepPrice: true,
          },
        },
      },
    });
  }

  /**
   * Get bids for a product
   */
  static async getByProduct(productId, limit = 50) {
    return prisma.bid.findMany({
      where: { productId },
      include: {
        bidder: {
          select: {
            id: true,
            fullName: true,
            positiveRatings: true,
            negativeRatings: true,
          },
        },
      },
      orderBy: [{ amount: 'desc' }, { createdAt: 'asc' }],
      take: limit,
    });
  }

  /**
   * Get bids by user
   */
  static async getByUser(bidderId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [bids, total] = await Promise.all([
      prisma.bid.findMany({
        where: { bidderId },
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
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.bid.count({ where: { bidderId } }),
    ]);

    return { bids, total, page, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Get the highest bid for a product
   */
  static async getHighestBid(productId) {
    return prisma.bid.findFirst({
      where: { productId },
      orderBy: { amount: 'desc' },
      include: {
        bidder: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get user's highest bid on a product
   */
  static async getUserHighestBid(productId, bidderId) {
    return prisma.bid.findFirst({
      where: {
        productId,
        bidderId,
      },
      orderBy: { amount: 'desc' },
    });
  }

  /**
   * Check if user has bid on product
   */
  static async hasUserBid(productId, bidderId) {
    const count = await prisma.bid.count({
      where: {
        productId,
        bidderId,
      },
    });
    return count > 0;
  }

  /**
   * Get all auto-bids for a product above a certain amount
   */
  static async getAutoBidsAboveAmount(productId, amount) {
    return prisma.bid.findMany({
      where: {
        productId,
        isAutoBid: true,
        maxAmount: {
          gte: amount,
        },
      },
      include: {
        bidder: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        maxAmount: 'desc',
      },
    });
  }

  /**
   * Get bid count for a product
   */
  static async getBidCount(productId) {
    return prisma.bid.count({
      where: { productId },
    });
  }

  /**
   * Get unique bidders count for a product
   */
  static async getUniqueBiddersCount(productId) {
    const bidders = await prisma.bid.findMany({
      where: { productId },
      select: { bidderId: true },
      distinct: ['bidderId'],
    });
    return bidders.length;
  }

  /**
   * Get recent bids across all products
   */
  static async getRecentBids(limit = 20) {
    return prisma.bid.findMany({
      include: {
        bidder: {
          select: {
            id: true,
            fullName: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }
}

export default BidModel;

