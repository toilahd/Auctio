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
          category: {
            select: {
              id: true,
              name: true,
              parent: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          seller: {
            select: {
              id: true,
              fullName: true,
              email: true,
              address: true,
              positiveRatings: true,
              negativeRatings: true
            }
          },
          currentWinner: {
            select: {
              id: true,
              fullName: true,
              email: true,
              positiveRatings: true,
              negativeRatings: true
            }
          },
          bids: {
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
              bidder: {
                select: {
                  id: true,
                  fullName: true,
                  email: true
                }
              }
            }
          },
          questions: {
            orderBy: { createdAt: 'desc' },
            include: {
              asker: {
                select: {
                  id: true,
                  fullName: true
                }
              },
              answer: {
                include: {
                  seller: {
                    select: {
                      id: true,
                      fullName: true
                    }
                  }
                }
              }
            }
          },
          _count: {
            select: {
              bids: true,
              questions: true
            }
          }
        }
      });

      if (!product) {
        return null;
      }

      // Calculate time left
      const now = new Date();
      const timeLeft = new Date(product.endTime) - now;
      const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

      // Get 5 related products from same category
      const relatedProducts = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          status: 'ACTIVE'
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          images: true,
          currentPrice: true,
          endTime: true,
          bidCount: true
        }
      });

      return {
        ...product,
        timeLeft: {
          days: daysLeft,
          hours: hoursLeft,
          minutes: minutesLeft,
          total: timeLeft,
          isLessThan3Days: daysLeft < 3
        },
        bidCount: product._count.bids,
        questionCount: product._count.questions,
        relatedProducts
      };
    } catch (error) {
      logger.error('Error getting product by ID:', error);
      throw error;
    }
  }

  /**
   * Get top 5 products by criteria for homepage
   */
  async getTopProducts(criteria = 'ending_soon') {
    try {
      let orderBy;
      let where = { status: 'ACTIVE' };

      switch (criteria) {
        case 'ending_soon':
          orderBy = { endTime: 'asc' };
          break;
        case 'most_bids':
          orderBy = { bidCount: 'desc' };
          break;
        case 'highest_price':
          orderBy = { currentPrice: 'desc' };
          break;
        default:
          orderBy = { endTime: 'asc' };
      }

      const products = await prisma.product.findMany({
        where,
        take: 5,
        orderBy,
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
      });

      return products.map(p => ({
        ...p,
        bidCount: p._count.bids
      }));
    } catch (error) {
      logger.error('Error getting top products:', error);
      throw error;
    }
  }

  /**
   * Get products by category with pagination
   */
  async getProductsByCategory(categoryId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: {
            categoryId,
            status: 'ACTIVE'
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
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
        }),
        prisma.product.count({
          where: {
            categoryId,
            status: 'ACTIVE'
          }
        })
      ]);

      return {
        products: products.map(p => ({ ...p, bidCount: p._count.bids })),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + products.length < total
        }
      };
    } catch (error) {
      logger.error('Error getting products by category:', error);
      throw error;
    }
  }
}

export default new ProductService();
