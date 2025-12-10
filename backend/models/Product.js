import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProductModel {
  /**
   * Create a new product
   */
  static async create(productData) {
    return prisma.product.create({
      data: {
        ...productData,
        currentPrice: productData.startPrice,
      },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            fullName: true,
            email: true,
            positiveRatings: true,
            negativeRatings: true,
          },
        },
      },
    });
  }

  /**
   * Find product by ID with full details
   */
  static async findById(id) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            fullName: true,
            email: true,
            positiveRatings: true,
            negativeRatings: true,
          },
        },
        bids: {
          include: {
            bidder: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: {
            amount: 'desc',
          },
        },
        currentWinner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        questions: {
          include: {
            asker: {
              select: {
                id: true,
                fullName: true,
              },
            },
            answer: {
              include: {
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
        },
      },
    });
  }

  /**
   * Get all active products with pagination
   */
  static async getActiveProducts(page = 1, limit = 20, filters = {}) {
    const skip = (page - 1) * limit;
    const where = {
      status: 'ACTIVE',
      endTime: {
        gt: new Date(),
      },
      ...filters,
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          seller: {
            select: {
              id: true,
              fullName: true,
              positiveRatings: true,
              negativeRatings: true,
            },
          },
          currentWinner: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Search products by title
   */
  static async search(query, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = {
      status: 'ACTIVE',
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { titleNoAccent: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          seller: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, page, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Get products by category
   */
  static async getByCategory(categoryId, page = 1, limit = 20) {
    return this.getActiveProducts(page, limit, { categoryId });
  }

  /**
   * Get products by seller
   */
  static async getBySeller(sellerId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { sellerId },
        include: {
          category: true,
          currentWinner: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.product.count({ where: { sellerId } }),
    ]);

    return { products, total, page, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Update product
   */
  static async update(id, updateData) {
    return prisma.product.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Increment view count
   */
  static async incrementViewCount(id) {
    return prisma.product.update({
      where: { id },
      data: {
        viewCount: { increment: 1 },
      },
    });
  }

  /**
   * Update current price and winner
   */
  static async updateBidInfo(id, newPrice, winnerId) {
    return prisma.product.update({
      where: { id },
      data: {
        currentPrice: newPrice,
        currentWinnerId: winnerId,
        bidCount: { increment: 1 },
      },
    });
  }

  /**
   * End auction
   */
  static async endAuction(id) {
    return prisma.product.update({
      where: { id },
      data: {
        status: 'ENDED',
      },
    });
  }

  /**
   * Cancel auction
   */
  static async cancelAuction(id) {
    return prisma.product.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });
  }

  /**
   * Get ending soon products
   */
  static async getEndingSoon(hours = 24, limit = 10) {
    const endTimeThreshold = new Date();
    endTimeThreshold.setHours(endTimeThreshold.getHours() + hours);

    return prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        endTime: {
          lte: endTimeThreshold,
          gt: new Date(),
        },
      },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        endTime: 'asc',
      },
      take: limit,
    });
  }

  /**
   * Add description history
   */
  static async addDescriptionHistory(productId, content) {
    return prisma.descriptionHistory.create({
      data: {
        productId,
        content,
      },
    });
  }

  /**
   * Get description history
   */
  static async getDescriptionHistory(productId) {
    return prisma.descriptionHistory.findMany({
      where: { productId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

export default ProductModel;

