import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class OrderModel {
  /**
   * Create a new order
   */
  static async create(orderData) {
    return prisma.order.create({
      data: orderData,
      include: {
        product: true,
        buyer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            address: true,
          },
        },
        seller: {
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
   * Get order by ID
   */
  static async findById(id) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            category: true,
          },
        },
        buyer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            address: true,
          },
        },
        seller: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        ratings: true,
        chatMessages: {
          include: {
            sender: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  /**
   * Get order by product ID
   */
  static async findByProductId(productId) {
    return prisma.order.findUnique({
      where: { productId },
      include: {
        product: true,
        buyer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        seller: {
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
   * Get buyer's orders
   */
  static async getByBuyer(buyerId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { buyerId },
        include: {
          product: {
            include: {
              category: true,
            },
          },
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
      prisma.order.count({ where: { buyerId } }),
    ]);

    return { orders, total, page, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Get seller's orders
   */
  static async getBySeller(sellerId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { sellerId },
        include: {
          product: {
            include: {
              category: true,
            },
          },
          buyer: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { sellerId } }),
    ]);

    return { orders, total, page, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Update order status
   */
  static async updateStatus(id, status) {
    return prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Mark as paid
   */
  static async markAsPaid(id, paymentData) {
    return prisma.order.update({
      where: { id },
      data: {
        isPaid: true,
        paidAt: new Date(),
        status: 'PAID',
        ...paymentData,
      },
    });
  }

  /**
   * Update shipping info
   */
  static async updateShipping(id, shippingData) {
    return prisma.order.update({
      where: { id },
      data: {
        ...shippingData,
        status: 'SHIPPING',
        shippedAt: new Date(),
      },
    });
  }

  /**
   * Mark as delivered
   */
  static async markAsDelivered(id) {
    return prisma.order.update({
      where: { id },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
        status: 'DELIVERED',
      },
    });
  }

  /**
   * Cancel order
   */
  static async cancel(id, cancelReason) {
    return prisma.order.update({
      where: { id },
      data: {
        isCancelled: true,
        cancelledAt: new Date(),
        cancelReason,
        status: 'CANCELLED',
      },
    });
  }

  /**
   * Complete order
   */
  static async complete(id) {
    return prisma.order.update({
      where: { id },
      data: {
        status: 'COMPLETED',
      },
    });
  }

  /**
   * Get orders by status
   */
  static async getByStatus(status, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { status },
        include: {
          product: true,
          buyer: {
            select: {
              id: true,
              fullName: true,
            },
          },
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
      prisma.order.count({ where: { status } }),
    ]);

    return { orders, total, page, totalPages: Math.ceil(total / limit) };
  }
}

export default OrderModel;

