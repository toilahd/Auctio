import prisma from '../config/prisma.js';
import { getLogger } from '../config/logger.js';
import { emitChatMessage, emitMessageRead } from '../config/socket.js';

const logger = getLogger('ChatService');

class ChatService {
  /**
   * Send a chat message (seller or winner only)
   */
  async sendMessage(orderId, senderId, content) {
    try {
      // Verify order exists and user is authorized
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          product: {
            select: {
              sellerId: true,
              title: true
            }
          },
          buyer: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Check if sender is authorized (seller or buyer)
      const isSeller = order.product.sellerId === senderId;
      const isBuyer = order.buyerId === senderId;

      if (!isSeller && !isBuyer) {
        throw new Error('You are not authorized to send messages in this chat');
      }

      // Create message
      const message = await prisma.chatMessage.create({
        data: {
          orderId,
          senderId,
          content
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        }
      });

      // Emit via socket to chat room
      emitChatMessage(orderId, {
        id: message.id,
        content: message.content,
        sender: message.sender,
        senderId: message.senderId,
        isRead: message.isRead,
        createdAt: message.createdAt
      });

      logger.info(`Chat message sent in order ${orderId} by user ${senderId}`);

      return message;
    } catch (error) {
      logger.error('Error sending chat message:', error);
      throw error;
    }
  }

  /**
   * Get chat messages for an order
   */
  async getMessages(orderId, userId, page = 1, limit = 50) {
    try {
      // Verify user is authorized
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          product: {
            select: {
              sellerId: true
            }
          }
        }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      const isSeller = order.product.sellerId === userId;
      const isBuyer = order.buyerId === userId;

      if (!isSeller && !isBuyer) {
        throw new Error('You are not authorized to view this chat');
      }

      const skip = (page - 1) * limit;

      const [messages, total] = await Promise.all([
        prisma.chatMessage.findMany({
          where: { orderId },
          skip,
          take: limit,
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        }),
        prisma.chatMessage.count({
          where: { orderId }
        })
      ]);

      return {
        messages,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + messages.length < total
      };
    } catch (error) {
      logger.error('Error getting chat messages:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(orderId, userId) {
    try {
      // Verify user is authorized
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          product: {
            select: {
              sellerId: true
            }
          }
        }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      const isSeller = order.product.sellerId === userId;
      const isBuyer = order.buyerId === userId;

      if (!isSeller && !isBuyer) {
        throw new Error('You are not authorized to mark messages as read');
      }

      // Mark all messages from other user as read
      const result = await prisma.chatMessage.updateMany({
        where: {
          orderId,
          senderId: { not: userId },
          isRead: false
        },
        data: {
          isRead: true
        }
      });

      // Emit notification via socket
      if (result.count > 0) {
        emitMessageRead(orderId, {
          userId,
          count: result.count
        });
      }

      logger.info(`Marked ${result.count} messages as read in order ${orderId}`);

      return { count: result.count };
    } catch (error) {
      logger.error('Error marking messages as read:', error);
      throw error;
    }
  }

  /**
   * Get unread message count for a user across all their chats
   */
  async getUnreadCount(userId) {
    try {
      // Get orders where user is buyer or seller
      const orders = await prisma.order.findMany({
        where: {
          OR: [
            { buyerId: userId },
            {
              product: {
                sellerId: userId
              }
            }
          ]
        },
        select: {
          id: true
        }
      });

      const orderIds = orders.map(o => o.id);

      // Count unread messages from other users
      const unreadCount = await prisma.chatMessage.count({
        where: {
          orderId: { in: orderIds },
          senderId: { not: userId },
          isRead: false
        }
      });

      return { unreadCount };
    } catch (error) {
      logger.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Get all chats for a user (list of orders with last message)
   */
  async getUserChats(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      // Get orders where user is buyer or seller
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: {
            OR: [
              { buyerId: userId },
              {
                product: {
                  sellerId: userId
                }
              }
            ]
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: true,
                sellerId: true,
                seller: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true
                  }
                }
              }
            },
            buyer: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            },
            chatMessages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                sender: {
                  select: {
                    id: true,
                    fullName: true
                  }
                }
              }
            }
          }
        }),
        prisma.order.count({
          where: {
            OR: [
              { buyerId: userId },
              {
                product: {
                  sellerId: userId
                }
              }
            ]
          }
        })
      ]);

      // Get unread count for each chat
      const chatsWithUnread = await Promise.all(
        orders.map(async (order) => {
          const unreadCount = await prisma.chatMessage.count({
            where: {
              orderId: order.id,
              senderId: { not: userId },
              isRead: false
            }
          });

          // Determine the other party
          const isSeller = order.product.sellerId === userId;
          const otherParty = isSeller ? order.buyer : order.product.seller;

          return {
            orderId: order.id,
            product: {
              id: order.product.id,
              title: order.product.title,
              image: order.product.images[0] || null
            },
            otherParty,
            lastMessage: order.chatMessages[0] || null,
            unreadCount,
            createdAt: order.createdAt
          };
        })
      );

      return {
        chats: chatsWithUnread,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error getting user chats:', error);
      throw error;
    }
  }
}

export default new ChatService();

