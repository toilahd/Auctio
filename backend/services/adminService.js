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

}


export default new AdminService();

