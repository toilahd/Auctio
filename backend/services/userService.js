// services/userService.js
import prisma from '../config/prisma.js';
import { getLogger } from '../config/logger.js';
import bcrypt from 'bcrypt';

const logger = getLogger('UserService');

class UserService {
  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          address: true,
          dateOfBirth: true,
          role: true,
          positiveRatings: true,
          negativeRatings: true,
          upgradeRequested: true,
          upgradeRequestedAt: true,
          upgradeStatus: true,
          createdAt: true,
          isVerified: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const totalRatings = user.positiveRatings + user.negativeRatings;
      const ratingPercentage = totalRatings > 0
        ? (user.positiveRatings / totalRatings) * 100
        : 0;

      return {
        ...user,
        ratingPercentage: Math.round(ratingPercentage * 10) / 10,
        totalRatings
      };
    } catch (error) {
      logger.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, { email, fullName, address, dateOfBirth }) {
    try {
      const updates = {};

      if (email) {
        // Check if email is already taken by another user
        const existing = await prisma.user.findFirst({
          where: {
            email,
            id: { not: userId }
          }
        });
        if (existing) {
          throw new Error('Email already in use');
        }
        updates.email = email;
      }

      if (fullName) updates.fullName = fullName;
      if (address) updates.address = address;
      if (dateOfBirth) updates.dateOfBirth = new Date(dateOfBirth);

      const user = await prisma.user.update({
        where: { id: userId },
        data: updates,
        select: {
          id: true,
          email: true,
          fullName: true,
          address: true,
          dateOfBirth: true,
          role: true,
          positiveRatings: true,
          negativeRatings: true
        }
      });

      return user;
    } catch (error) {
      logger.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify old password
      const isValid = await bcrypt.compare(oldPassword, user.password);
      if (!isValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });

      return { success: true };
    } catch (error) {
      logger.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Get user ratings
   */
  async getUserRatings(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const [ratings, total] = await Promise.all([
        prisma.rating.findMany({
          where: { toUserId: userId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            fromUser: {
              select: {
                id: true,
                fullName: true
              }
            }
          }
        }),
        prisma.rating.count({ where: { toUserId: userId } })
      ]);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          positiveRatings: true,
          negativeRatings: true
        }
      });

      const totalRatings = user.positiveRatings + user.negativeRatings;
      const ratingPercentage = totalRatings > 0
        ? (user.positiveRatings / totalRatings) * 100
        : 0;

      return {
        summary: {
          positive: user.positiveRatings,
          negative: user.negativeRatings,
          total: totalRatings,
          percentage: Math.round(ratingPercentage * 10) / 10
        },
        ratings,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + ratings.length < total
        }
      };
    } catch (error) {
      logger.error('Error getting user ratings:', error);
      throw error;
    }
  }

  /**
   * Get user's bidding products
   */
  async getUserBiddingProducts(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      // Get distinct products where user has placed bids
      const bids = await prisma.bid.findMany({
        where: { bidderId: userId },
        distinct: ['productId'],
        select: { productId: true }
      });

      const productIds = bids.map(b => b.productId);

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: {
            id: { in: productIds },
            status: {
              in: ['ACTIVE', 'ENDED'] // Include both active and ended products
            }
          },
          skip,
          take: limit,
          orderBy: [
            { status: 'asc' }, // ACTIVE first, then ENDED
            { endTime: 'asc' }  // Within each group, sort by end time
          ],
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
            seller: {
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
            id: { in: productIds },
            status: {
              in: ['ACTIVE', 'ENDED']
            }
          }
        })
      ]);

      const productsWithStatus = products.map(p => ({
        ...p,
        bidCount: p._count.bids,
        isWinning: p.currentWinnerId === userId,
        hasWon: p.status === 'ENDED' && p.currentWinnerId === userId,
        hasLost: p.status === 'ENDED' && p.currentWinnerId !== userId
      }));

      return {
        products: productsWithStatus,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + products.length < total
        }
      };
    } catch (error) {
      logger.error('Error getting bidding products:', error);
      throw error;
    }
  }

  /**
   * Get user's won products
   */
  async getUserWonProducts(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: {
            currentWinnerId: userId,
            status: 'ENDED'
          },
          skip,
          take: limit,
          orderBy: { endTime: 'desc' },
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
                positiveRatings: true,
                negativeRatings: true
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
            currentWinnerId: userId,
            status: 'ENDED'
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
      logger.error('Error getting won products:', error);
      throw error;
    }
  }

  /**
   * Rate a seller
   */
  async rateSeller(fromUserId, toUserId, type, comment, orderId = null) {
    try {
      // Check if seller exists
      const seller = await prisma.user.findUnique({
        where: { id: toUserId }
      });

      if (!seller) {
        throw new Error('Seller not found');
      }

      if (seller.role !== 'SELLER' && seller.role !== 'ADMIN') {
        throw new Error('Can only rate sellers');
      }

      // Create rating
      const rating = await prisma.$transaction(async (tx) => {
        const newRating = await tx.rating.create({
          data: {
            fromUserId,
            toUserId,
            type,
            comment,
            orderId
          },
          include: {
            fromUser: {
              select: {
                id: true,
                fullName: true
              }
            }
          }
        });

        // Update seller's rating count
        if (type === 'POSITIVE') {
          await tx.user.update({
            where: { id: toUserId },
            data: { positiveRatings: { increment: 1 } }
          });
        } else {
          await tx.user.update({
            where: { id: toUserId },
            data: { negativeRatings: { increment: 1 } }
          });
        }

        return newRating;
      });

      return rating;
    } catch (error) {
      logger.error('Error rating seller:', error);
      throw error;
    }
  }

  /**
   * Request seller upgrade
   */
  async requestSellerUpgrade(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.role === 'SELLER' || user.role === 'ADMIN') {
        throw new Error('User is already a seller');
      }

      if (user.upgradeRequested && user.upgradeStatus === 'PENDING') {
        throw new Error('Upgrade request already pending');
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          upgradeRequested: true,
          upgradeRequestedAt: new Date(),
          upgradeStatus: 'PENDING'
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          upgradeRequested: true,
          upgradeRequestedAt: true,
          upgradeStatus: true
        }
      });

      return updated;
    } catch (error) {
      logger.error('Error requesting seller upgrade:', error);
      throw error;
    }
  }

  /**
   * Check if user can bid based on rating
   */
  canUserBid(user, product) {
    const totalRatings = user.positiveRatings + user.negativeRatings;

    // No ratings yet - check if seller allows
    if (totalRatings === 0) {
      // For now, allow unrated users to bid
      // You can add a product.allowUnratedBidders field if needed
      return { canBid: true, reason: 'No ratings yet, allowed by default' };
    }

    // Calculate rating percentage
    const percentage = (user.positiveRatings / totalRatings) * 100;

    if (percentage < 80) {
      return {
        canBid: false,
        reason: `Rating too low: ${Math.round(percentage)}% (${user.positiveRatings}/${totalRatings}). Minimum required: 80%`
      };
    }

    return { canBid: true };
  }
}

export default new UserService();

