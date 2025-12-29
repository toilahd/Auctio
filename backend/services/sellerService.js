import prisma from '../config/prisma.js';
import { getLogger } from '../config/logger.js';

const logger = getLogger('SellerService');

class SellerService {
  // ==================== PRODUCT CREATION ====================

  /**
   * Create a new auction product
   */
  async createProduct(sellerId, productData) {
    const {
      title,
      description,
      images,
      startPrice,
      stepPrice,
      buyNowPrice,
      categoryId,
      autoExtend,
      endTime
    } = productData;

    // Validate minimum 3 images
    if (!images || images.length < 3) {
      throw new Error('At least 3 images are required');
    }

    // Validate seller is actually a seller
    const seller = await prisma.user.findUnique({
      where: { id: sellerId }
    });

    if (!seller || seller.role !== 'SELLER') {
      throw new Error('Only sellers can create products');
    }

    // Remove Vietnamese accents for search
    const titleNoAccent = this.removeVietnameseAccents(title);

    // Create product
    const product = await prisma.product.create({
      data: {
        title,
        titleNoAccent,
        description,
        images,
        startPrice,
        stepPrice,
        buyNowPrice,
        currentPrice: startPrice,
        categoryId,
        sellerId,
        autoExtend: autoExtend || false,
        endTime: new Date(endTime),
        status: 'ACTIVE'
      },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            fullName: true,
            email: true,
            positiveRatings: true,
            negativeRatings: true
          }
        }
      }
    });

    logger.info(`Product created: ${product.id} by seller ${sellerId}`);
    return product;
  }

  // ==================== PRODUCT DESCRIPTION UPDATE ====================

  /**
   * Append additional description to product
   * New description is appended to old, not replaced
   */
  async appendDescription(sellerId, productId, newDescription) {
    // Verify ownership
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.sellerId !== sellerId) {
      throw new Error('You can only edit your own products');
    }

    if (product.status !== 'ACTIVE') {
      throw new Error('Cannot edit ended or cancelled products');
    }

    // Append description with timestamp marker
    const timestamp = new Date().toISOString().split('T')[0];
    const updatedDescription = `${product.description}\n\n${timestamp}\n${newDescription}`;

    // Update product and create history record
    const [updatedProduct] = await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { description: updatedDescription }
      }),
      prisma.descriptionHistory.create({
        data: {
          productId,
          content: newDescription
        }
      })
    ]);

    logger.info(`Description appended to product ${productId}`);
    return updatedProduct;
  }

  // ==================== DENY BIDDER ====================

  /**
   * Deny a bidder from bidding on a product
   * If bidder is current winner, transfer to second highest bidder
   */
  async denyBidder(sellerId, productId, bidderId, reason) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        bids: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.sellerId !== sellerId) {
      throw new Error('You can only manage your own products');
    }

    if (product.status !== 'ACTIVE') {
      throw new Error('Cannot deny bidders on ended products');
    }

    // Check if bidder has bid on this product
    const bidderHasBid = product.bids.some(bid => bid.bidderId === bidderId);
    if (!bidderHasBid) {
      throw new Error('Bidder has not placed any bids on this product');
    }

    await prisma.$transaction(async (tx) => {
      // Add to denied list
      await tx.deniedBidder.create({
        data: {
          productId,
          bidderId,
          reason
        }
      });

      // If denied bidder is current winner, find second highest
      if (product.currentWinnerId === bidderId) {
        // Get all bids excluding denied bidder, sorted by amount desc
        const remainingBids = await tx.bid.findMany({
          where: {
            productId,
            bidderId: { not: bidderId }
          },
          orderBy: {
            amount: 'desc'
          },
          take: 1
        });

        if (remainingBids.length > 0) {
          const secondHighest = remainingBids[0];
          await tx.product.update({
            where: { id: productId },
            data: {
              currentWinnerId: secondHighest.bidderId,
              currentPrice: secondHighest.amount
            }
          });
        } else {
          // No other bidders, reset to start price
          await tx.product.update({
            where: { id: productId },
            data: {
              currentWinnerId: null,
              currentPrice: product.startPrice
            }
          });
        }
      }
    });

    logger.info(`Bidder ${bidderId} denied from product ${productId}`);
    return { success: true, message: 'Bidder denied successfully' };
  }

  // ==================== SELLER PRODUCT MANAGEMENT ====================
  // Note: answerQuestion is handled by questionService.js

  /**
   * Get seller's active products
   */
  async getSellerActiveProducts(sellerId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          sellerId,
          status: 'ACTIVE'
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          currentWinner: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          _count: {
            select: {
              bids: true,
              watchLists: true
            }
          }
        }
      }),
      prisma.product.count({
        where: {
          sellerId,
          status: 'ACTIVE'
        }
      })
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get seller's products with winners (completed auctions)
   */
  async getSellerCompletedProducts(sellerId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          sellerId,
          status: 'ENDED',
          currentWinnerId: { not: null }
        },
        skip,
        take: limit,
        orderBy: { endTime: 'desc' },
        include: {
          category: true,
          currentWinner: {
            select: {
              id: true,
              fullName: true,
              email: true,
              positiveRatings: true,
              negativeRatings: true
            }
          },
          order: true,
          _count: {
            select: {
              bids: true
            }
          }
        }
      }),
      prisma.product.count({
        where: {
          sellerId,
          status: 'ENDED',
          currentWinnerId: { not: null }
        }
      })
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Rate a winner (buyer)
   */
  async rateWinner(sellerId, productId, rating, comment) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        currentWinner: true
      }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.sellerId !== sellerId) {
      throw new Error('You can only rate winners of your products');
    }

    if (!product.currentWinnerId) {
      throw new Error('This product has no winner');
    }

    if (product.status !== 'ENDED') {
      throw new Error('Cannot rate before auction ends');
    }

    // Check if already rated
    const existingRating = await prisma.rating.findFirst({
      where: {
        fromUserId: sellerId,
        toUserId: product.currentWinnerId,
        productId
      }
    });

    if (existingRating) {
      throw new Error('You have already rated this winner');
    }

    const isPositive = rating > 0;

    await prisma.$transaction(async (tx) => {
      // Create rating
      await tx.rating.create({
        data: {
          fromUserId: sellerId,
          toUserId: product.currentWinnerId,
          comment,
          isPositive,
          productId
        }
      });

      // Update winner's rating count
      if (isPositive) {
        await tx.user.update({
          where: { id: product.currentWinnerId },
          data: { positiveRatings: { increment: 1 } }
        });
      } else {
        await tx.user.update({
          where: { id: product.currentWinnerId },
          data: { negativeRatings: { increment: 1 } }
        });
      }
    });

    logger.info(`Seller ${sellerId} rated winner ${product.currentWinnerId} for product ${productId}`);
    return { success: true, message: 'Rating submitted successfully' };
  }

  /**
   * Cancel transaction and auto-rate winner negatively
   */
  async cancelTransaction(sellerId, productId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        currentWinner: true
      }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.sellerId !== sellerId) {
      throw new Error('You can only cancel transactions for your products');
    }

    if (!product.currentWinnerId) {
      throw new Error('This product has no winner');
    }

    if (product.status !== 'ENDED') {
      throw new Error('Cannot cancel before auction ends');
    }

    await prisma.$transaction(async (tx) => {
      // Create negative rating with default comment
      await tx.rating.create({
        data: {
          fromUserId: sellerId,
          toUserId: product.currentWinnerId,
          comment: 'Người thắng không thanh toán',
          isPositive: false,
          productId
        }
      });

      // Update winner's negative rating count
      await tx.user.update({
        where: { id: product.currentWinnerId },
        data: { negativeRatings: { increment: 1 } }
      });

      // Update product status
      await tx.product.update({
        where: { id: productId },
        data: { status: 'CANCELLED' }
      });
    });

    logger.info(`Transaction cancelled for product ${productId} by seller ${sellerId}`);
    return { success: true, message: 'Transaction cancelled and winner rated negatively' };
  }

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Remove Vietnamese accents for search
   */
  removeVietnameseAccents(str) {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();
  }
}

export default new SellerService();

