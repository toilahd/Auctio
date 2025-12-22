// services/biddingService.js
import prisma from '../config/prisma.js';
import { getLogger } from '../config/logger.js';

const logger = getLogger('BiddingService');

/**
 * Pure function: resolve auto-bid logic
 */
function resolveAutoBid({ currentMax, currentBidderId, newMax, newBidderId, step }) {
  const bids = [];
  let winnerId;
  let finalPrice;

  if (newMax > currentMax) {
    winnerId = newBidderId;
    finalPrice = Math.min(currentMax + step, newMax);
    bids.push({
      bidderId: newBidderId,
      amount: finalPrice,
      maxAmount: newMax,
      isAutoBid: false
    });
  } else if (newMax < currentMax) {
    winnerId = currentBidderId;
    finalPrice = Math.min(newMax + step, currentMax);
    bids.push(
      {
        bidderId: newBidderId,
        amount: newMax,
        maxAmount: newMax,
        isAutoBid: false
      },
      {
        bidderId: currentBidderId,
        amount: finalPrice,
        maxAmount: currentMax,
        isAutoBid: true
      }
    );
  } else {
    winnerId = currentBidderId;
    finalPrice = currentMax;
    bids.push({
      bidderId: newBidderId,
      amount: newMax,
      maxAmount: newMax,
      isAutoBid: false
    });
  }

  return { winnerId, finalPrice, bids };
}

class BiddingService {
  async placeBid({ productId, bidderId, maxAmount }) {
    if (!maxAmount) throw new Error('maxAmount is required');

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        include: {
          bids: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!product) throw new Error('Product not found');
      if (product.status !== 'ACTIVE') throw new Error('Auction not active');
      if (new Date() > product.endTime) throw new Error('Auction ended');
      if (product.sellerId === bidderId) throw new Error('Seller cannot bid');

      // Check bidder rating
      const bidder = await tx.user.findUnique({
        where: { id: bidderId },
        select: {
          positiveRatings: true,
          negativeRatings: true
        }
      });

      const totalRatings = bidder.positiveRatings + bidder.negativeRatings;
      if (totalRatings > 0) {
        const ratingPercentage = (bidder.positiveRatings / totalRatings) * 100;
        if (ratingPercentage < 80) {
          throw new Error(`Rating too low: ${Math.round(ratingPercentage)}% (${bidder.positiveRatings}/${totalRatings}). Minimum required: 80%`);
        }
      }

      const step = Number(product.stepPrice);
      const lastBid = product.bids[0];

      if (!lastBid) {
        await tx.bid.create({
          data: {
            productId,
            bidderId,
            amount: product.startPrice,
            maxAmount,
            isAutoBid: false
          }
        });

        await tx.product.update({
          where: { id: productId },
          data: {
            currentPrice: product.startPrice,
            currentWinnerId: bidderId,
            bidCount: { increment: 1 }
          }
        });

        return {
          success: true,
          winnerId: bidderId,
          currentPrice: product.startPrice
        };
      }

      if (product.currentWinnerId === bidderId) {
        throw new Error('Already highest bidder');
      }

      const resolved = resolveAutoBid({
        currentMax: Number(lastBid.maxAmount),
        currentBidderId: product.currentWinnerId,
        newMax: Number(maxAmount),
        newBidderId: bidderId,
        step
      });

      for (const bid of resolved.bids) {
        await tx.bid.create({
          data: { productId, ...bid }
        });
      }

      await tx.product.update({
        where: { id: productId },
        data: {
          currentPrice: resolved.finalPrice,
          currentWinnerId: resolved.winnerId,
          bidCount: { increment: resolved.bids.length }
        }
      });

      const timeLeft = new Date(product.endTime) - new Date();
      if (product.autoExtend && timeLeft < 300000) {
        await tx.product.update({
          where: { id: productId },
          data: { endTime: new Date(Date.now() + 600000) }
        });
      }

      return {
        success: true,
        winnerId: resolved.winnerId,
        currentPrice: resolved.finalPrice
      };
    });
  }

  /**
   * Get bid history for a product
   * Masks bidder names for privacy (e.g., "John Doe" -> "****Doe")
   */
  async getBidHistory(productId, limit = 20, offset = 0) {
    try {
      const bids = await prisma.bid.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          bidder: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      });

      const total = await prisma.bid.count({ where: { productId } });

      // Mask bidder names for privacy
      const maskedBids = bids.map(bid => {
        const fullName = bid.bidder.fullName;
        const nameParts = fullName.trim().split(' ');
        let maskedName;

        if (nameParts.length === 1) {
          // Single name: show last 3 chars
          maskedName = '****' + fullName.slice(-3);
        } else {
          // Multiple names: mask all except last name
          const lastName = nameParts[nameParts.length - 1];
          maskedName = '****' + lastName;
        }

        return {
          id: bid.id,
          amount: bid.amount,
          maxAmount: null, // Don't expose max amount
          isAutoBid: bid.isAutoBid,
          createdAt: bid.createdAt,
          bidder: {
            id: bid.bidder.id,
            fullName: maskedName,
            email: null // Don't expose email
          }
        };
      });

      return {
        bids: maskedBids,
        total,
        limit,
        offset
      };
    } catch (error) {
      logger.error('Error getting bid history:', error);
      throw error;
    }
  }

  /**
   * Get current winning bid for a product
   */
  async getCurrentWinner(productId) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          currentWinner: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          bids: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      return {
        currentPrice: product.currentPrice,
        currentWinner: product.currentWinner,
        lastBid: product.bids[0] || null,
        bidCount: product.bidCount
      };
    } catch (error) {
      logger.error('Error getting current winner:', error);
      throw error;
    }
  }

  /**
   * Check if user can bid on product
   */
  async canUserBid(productId, userId) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        return { canBid: false, reason: 'Product not found' };
      }

      if (product.status !== 'ACTIVE') {
        return { canBid: false, reason: 'Auction is not active' };
      }

      if (new Date() > new Date(product.endTime)) {
        return { canBid: false, reason: 'Auction has ended' };
      }

      if (product.sellerId === userId) {
        return { canBid: false, reason: 'Cannot bid on your own product' };
      }

      const isDenied = await prisma.deniedBidder.findFirst({
        where: { productId, bidderId: userId }
      });

      if (isDenied) {
        return { canBid: false, reason: 'You are blocked from bidding on this product' };
      }

      return { canBid: true };
    } catch (error) {
      logger.error('Error checking bid permission:', error);
      throw error;
    }
  }
}

export default new BiddingService();
