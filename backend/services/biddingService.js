// services/biddingService.js
import prisma from '../config/prisma.js';
import { getLogger } from '../config/logger.js';
import AuctionSettingsService from './auctionSettingsService.js';
import emailNotificationService from './emailNotificationService.js';

const logger = getLogger('BiddingService');

/**
 * Pure function: resolve auto-bid logic (Proxy Bidding)
 *
 * Nguyên tắc:
 * - Mỗi bidder nhập max bid
 * - Hệ thống chỉ tăng giá vừa đủ để thắng (current price = đối thủ + step)
 * - Người có max bid cao nhất giữ giá
 * - Khi max bằng nhau: người vào trước được ưu tiên
 */
function resolveAutoBid({ currentMax, currentBidderId, newMax, newBidderId, step }) {
  console.log('\n=== RESOLVE AUTO BID ===');
  console.log('Current Bidder ID:', currentBidderId);
  console.log('Current Max Bid:', currentMax.toLocaleString(), 'VND');
  console.log('New Bidder ID:', newBidderId);
  console.log('New Max Bid:', newMax.toLocaleString(), 'VND');
  console.log('Step Price:', step.toLocaleString(), 'VND');

  const bids = [];
  let winnerId;
  let finalPrice;

  // Case 1: Bidder mới có max cao hơn
  if (newMax > currentMax) {
    winnerId = newBidderId;
    // Giá chỉ tăng vừa đủ để thắng người cũ (max cũ + step)
    // Nhưng không vượt quá max của người mới
    finalPrice = Math.min(currentMax + step, newMax);

    console.log('→ Case 1: New max > Current max');
    console.log('→ New bidder WINS!');
    console.log('→ Final Price:', finalPrice.toLocaleString(), 'VND');

    // Chỉ tạo 1 bid của người mới
    bids.push({
      bidderId: newBidderId,
      amount: finalPrice,
      maxAmount: newMax,
      isAutoBid: false
    });
  }
  // Case 2: Bidder mới có max thấp hơn
  else if (newMax < currentMax) {
    winnerId = currentBidderId;
    // Giá tăng vừa đủ để thắng người mới (max mới + step)
    // Nhưng không vượt quá max của người giữ giá
    finalPrice = Math.min(newMax + step, currentMax);

    console.log('→ Case 2: New max < Current max');
    console.log('→ Current bidder KEEPS winning!');
    console.log('→ Final Price:', finalPrice.toLocaleString(), 'VND');

    // Tạo bid của người mới
    bids.push({
      bidderId: newBidderId,
      amount: newMax,
      maxAmount: newMax,
      isAutoBid: false
    });

    // Chỉ tạo auto-bid nếu giá thực sự tăng
    if (finalPrice > newMax) {
      console.log('→ Creating AUTO-BID for current bidder');
      bids.push({
        bidderId: currentBidderId,
        amount: finalPrice,
        maxAmount: currentMax,
        isAutoBid: true
      });
    }
  }
  // Case 3: Hai max bằng nhau
  else {
    // Người vào trước được ưu tiên giữ giá
    winnerId = currentBidderId;
    // Người sau phải bid toàn bộ max nhưng vẫn thua
    finalPrice = newMax;

    console.log('→ Case 3: Max bids are EQUAL');
    console.log('→ Current bidder wins (first-come priority)');
    console.log('→ Final Price:', finalPrice.toLocaleString(), 'VND');

    // Tạo bid của người mới (bid toàn bộ max nhưng vẫn thua)
    bids.push({
      bidderId: newBidderId,
      amount: newMax,
      maxAmount: newMax,
      isAutoBid: false
    });
  }

  console.log('→ Winner ID:', winnerId);
  console.log('→ Bids to create:', bids.length);
  console.log('========================\n');

  return { winnerId, finalPrice, bids };
}

class BiddingService {
  async placeBid({ productId, bidderId, maxAmount }) {
    if (!maxAmount) throw new Error('Số tiền đấu giá là bắt buộc');

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

      if (!product) throw new Error('Không tìm thấy sản phẩm');
      if (product.status !== 'ACTIVE') throw new Error('Phiên đấu giá không còn hoạt động');
      if (new Date() > product.endTime) throw new Error('Phiên đấu giá đã kết thúc');
      if (product.sellerId === bidderId) throw new Error('Người bán không thể đấu giá sản phẩm của mình');

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
          throw new Error(`Điểm đánh giá quá thấp: ${Math.round(ratingPercentage)}% (${bidder.positiveRatings}/${totalRatings}). Yêu cầu tối thiểu: 80%`);
        }
      }

      const step = Number(product.stepPrice);
      const lastBid = product.bids[0];
      const buyNowPrice = product.buyNowPrice ? Number(product.buyNowPrice) : null;

      // Check if bid meets or exceeds buy now price
      if (buyNowPrice && maxAmount >= buyNowPrice) {
        // Create winning bid at buy now price
        await tx.bid.create({
          data: {
            productId,
            bidderId,
            amount: buyNowPrice,
            maxAmount: buyNowPrice,
            isAutoBid: false
          }
        });

        // Close auction immediately and mark as ended
        await tx.product.update({
          where: { id: productId },
          data: {
            currentPrice: buyNowPrice,
            currentWinnerId: bidderId,
            bidCount: { increment: 1 },
            status: 'ENDED', // Kết thúc đấu giá (đã mua với giá mua ngay)
            endTime: new Date() // Cập nhật thời gian kết thúc
          }
        });

        // Fetch complete data for email notification
        const productWithDetails = await tx.product.findUnique({
          where: { id: productId },
          include: {
            seller: {
              select: { id: true, fullName: true, email: true }
            }
          }
        });

        const winnerDetails = await tx.user.findUnique({
          where: { id: bidderId },
          select: { id: true, fullName: true, email: true }
        });

        // Send auction ended email notifications asynchronously
        setImmediate(() => {
          emailNotificationService.notifyAuctionEndedWithWinner({
            product: productWithDetails,
            winner: winnerDetails,
            finalPrice: buyNowPrice
          });
        });

        return {
          success: true,
          winnerId: bidderId,
          currentPrice: buyNowPrice,
          buyNowTriggered: true,
          message: 'Phiên đấu giá đã kết thúc - Đã đạt giá mua ngay!'
        };
      }

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

        // Fetch complete data for email notification (after transaction)
        const productWithDetails = await tx.product.findUnique({
          where: { id: productId },
          include: {
            seller: {
              select: { id: true, fullName: true, email: true }
            }
          }
        });

        const newBidderDetails = await tx.user.findUnique({
          where: { id: bidderId },
          select: { id: true, fullName: true, email: true }
        });

        // Send email notifications asynchronously (after transaction commits)
        setImmediate(() => {
          emailNotificationService.notifyBidPlaced({
            product: productWithDetails,
            newBidder: newBidderDetails,
            newPrice: product.startPrice,
            previousWinner: null
          });
        });

        return {
          success: true,
          winnerId: bidderId,
          currentPrice: product.startPrice
        };
      }

      if (product.currentWinnerId === bidderId) {
        throw new Error('Bạn đã là người đấu giá cao nhất');
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

      // Auto-extend logic with dynamic settings
      const settings = await AuctionSettingsService.getSettings();
      const autoExtendThreshold = settings.autoExtendThreshold * 60 * 1000; // Convert minutes to ms
      const autoExtendDuration = settings.autoExtendDuration * 60 * 1000;

      const timeLeft = new Date(product.endTime) - new Date();
      if (product.autoExtend && timeLeft < autoExtendThreshold) {
        await tx.product.update({
          where: { id: productId },
          data: { endTime: new Date(Date.now() + autoExtendDuration) }
        });

        logger.info(`Auto-extended product ${productId} by ${settings.autoExtendDuration} minutes`);
      }

      // Fetch complete data for email notification
      const productWithDetails = await tx.product.findUnique({
        where: { id: productId },
        include: {
          seller: {
            select: { id: true, fullName: true, email: true }
          }
        }
      });

      const newBidderDetails = await tx.user.findUnique({
        where: { id: bidderId },
        select: { id: true, fullName: true, email: true }
      });

      const previousWinnerDetails = product.currentWinnerId ? await tx.user.findUnique({
        where: { id: product.currentWinnerId },
        select: { id: true, fullName: true, email: true }
      }) : null;

      // Send email notifications asynchronously (after transaction commits)
      setImmediate(() => {
        emailNotificationService.notifyBidPlaced({
          product: productWithDetails,
          newBidder: newBidderDetails,
          newPrice: resolved.finalPrice,
          previousWinner: previousWinnerDetails
        });
      });

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
        return { canBid: false, reason: 'Sản phẩm không tồn tại' };
      }

      if (product.status !== 'ACTIVE') {
        return { canBid: false, reason: 'Đấu giá không hoạt động' };
      }

      if (new Date() > new Date(product.endTime)) {
        return { canBid: false, reason: 'Đấu giá đã kết thúc' };
      }

      if (product.sellerId === userId) {
        return { canBid: false, reason: 'Không thể đặt giá cho sản phẩm của chính bạn' };
      }

      const isDenied = await prisma.deniedBidder.findFirst({
        where: { productId, bidderId: userId }
      });

      if (isDenied) {
        return { canBid: false, reason: 'Bạn bị chặn đặt giá cho sản phẩm này' };
      }

      return { canBid: true };
    } catch (error) {
      logger.error('Error checking bid permission:', error);
      throw error;
    }
  }
}

export default new BiddingService();
