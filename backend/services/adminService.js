import prisma from '../config/prisma.js';
import { getLogger } from '../config/logger.js';

const logger = getLogger('AdminService');

class AdminService {
  // ==================== CATEGORY MANAGEMENT ====================

  async getAllCategories({ page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        skip,
        take: limit,
        include: {
          parent: true,
          children: true,
          _count: {
            select: { products: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.category.count()
    ]);

    return {
      categories,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getCategoryById(id) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      }
    });
  }

  async createCategory({ name, parentId }) {
    if (parentId) {
      const parent = await prisma.category.findUnique({ where: { id: parentId } });
      if (!parent) throw new Error('Parent category not found');
      if (parent.parentId) throw new Error('Cannot create more than 2 levels of categories');
    }

    return prisma.category.create({
      data: { name, parentId },
      include: { parent: true }
    });
  }

  async updateCategory(id, { name, parentId }) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new Error('Category not found');

    if (parentId) {
      const parent = await prisma.category.findUnique({ where: { id: parentId } });
      if (!parent) throw new Error('Parent category not found');
      if (parent.parentId) throw new Error('Cannot create more than 2 levels of categories');
    }

    return prisma.category.update({
      where: { id },
      data: { name, parentId },
      include: { parent: true }
    });
  }

  async deleteCategory(id) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } }
    });

    if (!category) throw new Error('Category not found');
    if (category._count.products > 0) {
      throw new Error('Cannot delete category with existing products');
    }

    return prisma.category.delete({ where: { id } });
  }
  // ==================== PRODUCT MANAGEMENT ====================

  async getAllProducts({ page = 1, limit = 20, status, sellerId }) {
    const skip = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (sellerId) where.sellerId = sellerId;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          seller: { select: { id: true, fullName: true, email: true } },
          category: true,
          currentWinner: { select: { id: true, fullName: true, email: true } },
          _count: { select: { bids: true, watchLists: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getProductById(id) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        seller: true,
        category: true,
        currentWinner: true,
        bids: {
          include: { bidder: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: { select: { bids: true, watchLists: true, questions: true } }
      }
    });
  }

  async removeProduct(id, reason) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error('Product not found');

    return prisma.product.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    });
  }
  // ==================== USER MANAGEMENT ====================

  async getAllUsers({ page = 1, limit = 20, role }) {
    const skip = (page - 1) * limit;
    const where = role ? { role } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          positiveRatings: true,
          negativeRatings: true,
          upgradeRequested: true,
          upgradeRequestedAt: true,
          upgradeStatus: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: {
              products: true,
              bids: true,
              watchList: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getUserById(id) {
    return prisma.user.findUnique({
      where: { id },
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
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            products: true,
            bids: true,
            watchList: true,
            ratingsGiven: true,
            ratingsReceived: true
          }
        }
      }
    });
  }

  async getUpgradeRequests({ page = 1, limit = 20, status = 'PENDING' }) {
    const skip = (page - 1) * limit;
    const where = {
      upgradeRequested: true,
      upgradeStatus: status
    };

    const [requests, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          fullName: true,
          upgradeRequestedAt: true,
          upgradeStatus: true,
          positiveRatings: true,
          negativeRatings: true,
          createdAt: true,
          _count: {
            select: { bids: true }
          }
        },
        orderBy: { upgradeRequestedAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return {
      requests,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async approveUpgradeRequest(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    if (!user.upgradeRequested) throw new Error('No upgrade request found');
    if (user.upgradeStatus !== 'PENDING') throw new Error('Request already processed');

    return prisma.user.update({
      where: { id: userId },
      data: {
        role: 'SELLER',
        upgradeStatus: 'APPROVED'
      }
    });
  }

  async rejectUpgradeRequest(userId, reason) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    if (!user.upgradeRequested) throw new Error('No upgrade request found');
    if (user.upgradeStatus !== 'PENDING') throw new Error('Request already processed');

    return prisma.user.update({
      where: { id: userId },
      data: {
        upgradeStatus: 'REJECTED',
        upgradeRequested: false
      }
    });
  }

  async deleteUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!user) throw new Error('User not found');
    if (user._count.products > 0) {
      throw new Error('Cannot delete user with active products');
    }

    return prisma.user.delete({ where: { id: userId } });
  }

}


export default new AdminService();

