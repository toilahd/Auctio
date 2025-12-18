// services/productService.js
import prisma from '../config/prisma.js';
import { getLogger } from '../config/logger.js';

const logger = getLogger('ProductService');

class ProductService {
  /**
   * Search products with full-text search (Vietnamese accent-insensitive)
   */
  async searchProducts({
    searchQuery,
    categoryId,
    page = 1,
    limit = 20,
    sortBy = 'endTime',
    order = 'desc',
    highlightMinutes = 30
  }) {
    try {
      const skip = (page - 1) * limit;
      const where = {
        status: 'ACTIVE'
      };


      if (searchQuery) {
        where.OR = [
          {
            titleNoAccent: {
              contains: searchQuery.toLowerCase(),
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: searchQuery,
              mode: 'insensitive'
            }
          }
        ];
      }

      // Category filter
      if (categoryId) {
        where.categoryId = categoryId;
      }

      // Build orderBy
      const orderByMap = {
        endTime: { endTime: order },
        price: { currentPrice: order },
        newest: { createdAt: 'desc' },
        bidCount: { bidCount: 'desc' }
      };

      const orderBy = orderByMap[sortBy] || orderByMap.endTime;

      // Execute query
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            },
            seller: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            },
            _count: {
              select: {
                bids: true
              }
            }
          }
        }),
        prisma.product.count({ where })
      ]);

      // Mark recently posted products (highlight)
      const now = new Date();
      const highlightThreshold = new Date(now.getTime() - highlightMinutes * 60 * 1000);

      const productsWithMeta = products.map(product => {
        const isNew = new Date(product.createdAt) > highlightThreshold;
        const timeLeft = new Date(product.endTime) - now;
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

        return {
          ...product,
          isNew,
          timeLeft: {
            hours: hoursLeft,
            minutes: minutesLeft,
            total: timeLeft
          },
          bidCount: product._count.bids
        };
      });

      return {
        products: productsWithMeta,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + products.length < total
        },
        filters: {
          searchQuery,
          categoryId,
          sortBy,
          order
        }
      };
    } catch (error) {
      logger.error('Error searching products:', error);
      throw error;
    }
  }

  /**
   * Get product by ID with full details
   */
  async getProductById(id) {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          seller: {
            select: {
              id: true,
              fullName: true,
              email: true,
              address: true
            }
          },
          bids: {
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
              bidder: {
                select: {
                  id: true,
                  fullName: true
                }
              }
            }
          },
          currentWinner: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      });

      if (!product) {
        return null;
      }

      const now = new Date();
      const timeLeft = new Date(product.endTime) - now;

      return {
        ...product,
        timeLeft: {
          hours: Math.floor(timeLeft / (1000 * 60 * 60)),
          minutes: Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((timeLeft % (1000 * 60)) / 1000),
          total: timeLeft
        },
        isEnded: timeLeft <= 0
      };
    } catch (error) {
      logger.error('Error getting product by ID:', error);
      throw error;
    }
  }
}

export default new ProductService();

