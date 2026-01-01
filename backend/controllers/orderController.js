// controllers/orderController.js
import prisma from "../config/prisma.js";

const orderController = {
  /**
   * Seller confirms shipment (PAYED → SHIPPING)
   */
  confirmShipment: async (req, res) => {
    try {
      const { id: productId } = req.params;
      const userId = req.user.id;

      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { order: true },
      });

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Sản phẩm không tồn tại" });
      }

      if (product.sellerId !== userId) {
        return res
          .status(403)
          .json({ success: false, message: "Bạn không phải người bán" });
      }

      if (product.status !== "PAYED") {
        return res.status(400).json({
          success: false,
          message: "Chỉ có thể xác nhận gửi hàng khi đã thanh toán",
        });
      }

      // Update product status
      await prisma.product.update({
        where: { id: productId },
        data: { status: "SHIPPING" },
      });

      // Update order if exists
      if (product.order) {
        await prisma.order.update({
          where: { id: product.order.id },
          data: {
            status: "SHIPPING",
            shippedAt: new Date(),
          },
        });
      }

      return res.json({
        success: true,
        message: "Đã xác nhận gửi hàng thành công",
      });
    } catch (error) {
      console.error("Error confirming shipment:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  },

  /**
   * Buyer confirms delivery (SHIPPING → DELIVERED)
   */
  confirmDelivery: async (req, res) => {
    try {
      const { id: productId } = req.params;
      const userId = req.user.id;

      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { order: true },
      });

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Sản phẩm không tồn tại" });
      }

      if (product.currentWinnerId !== userId) {
        return res
          .status(403)
          .json({ success: false, message: "Bạn không phải người mua" });
      }

      if (product.status !== "SHIPPING") {
        return res.status(400).json({
          success: false,
          message: "Chỉ có thể xác nhận nhận hàng khi đang giao hàng",
        });
      }

      // Update product status
      await prisma.product.update({
        where: { id: productId },
        data: { status: "DELIVERED" },
      });

      // Update order if exists
      if (product.order) {
        await prisma.order.update({
          where: { id: product.order.id },
          data: {
            status: "DELIVERED",
            isDelivered: true,
            deliveredAt: new Date(),
          },
        });
      }

      return res.json({
        success: true,
        message: "Đã xác nhận nhận hàng thành công",
      });
    } catch (error) {
      console.error("Error confirming delivery:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  },

  /**
   * Seller cancels order (auto -1 rating to buyer)
   */
  cancelOrder: async (req, res) => {
    try {
      const { id: productId } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;

      if (!reason || reason.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: "Lý do hủy phải có ít nhất 10 ký tự",
        });
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { order: true },
      });

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Sản phẩm không tồn tại" });
      }

      if (product.sellerId !== userId) {
        return res
          .status(403)
          .json({ success: false, message: "Bạn không phải người bán" });
      }

      if (product.status === "COMPLETED" || product.status === "CANCELLED") {
        return res.status(400).json({
          success: false,
          message: "Không thể hủy đơn hàng đã hoàn tất hoặc đã hủy",
        });
      }

      if (!product.currentWinnerId) {
        return res.status(400).json({
          success: false,
          message: "Không có người thắng để hủy",
        });
      }

      // Update product status
      await prisma.product.update({
        where: { id: productId },
        data: { status: "CANCELLED" },
      });

      // Update order if exists
      if (product.order) {
        await prisma.order.update({
          where: { id: product.order.id },
          data: {
            status: "CANCELLED",
            isCancelled: true,
            cancelledAt: new Date(),
            cancelReason: reason.trim(),
          },
        });
      }

      // Create automatic -1 rating for buyer
      if (product.order) {
        await prisma.rating.create({
          data: {
            orderId: product.order.id,
            fromUserId: userId,
            toUserId: product.currentWinnerId,
            type: "NEGATIVE",
            comment: reason.trim(),
          },
        });

        // Update buyer's negative rating count
        await prisma.user.update({
          where: { id: product.currentWinnerId },
          data: { negativeRatings: { increment: 1 } },
        });
      }

      return res.json({
        success: true,
        message: "Đã hủy đơn hàng và đánh giá -1 người mua",
      });
    } catch (error) {
      console.error("Error cancelling order:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  },

  /**
   * Seller rejects current winner and moves to next highest bidder
   */
  rejectWinner: async (req, res) => {
    try {
      const { id: productId } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;

      if (!reason || reason.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: "Lý do từ chối phải có ít nhất 10 ký tự",
        });
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          order: true,
          bids: {
            orderBy: { amount: "desc" },
            include: {
              bidder: {
                select: {
                  id: true,
                  fullName: true,
                  positiveRatings: true,
                  negativeRatings: true,
                },
              },
            },
          },
        },
      });

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Sản phẩm không tồn tại" });
      }

      if (product.sellerId !== userId) {
        return res
          .status(403)
          .json({ success: false, message: "Bạn không phải người bán" });
      }

      if (product.status !== "ENDED") {
        return res.status(400).json({
          success: false,
          message: "Chỉ có thể từ chối người thắng ở trạng thái ENDED",
        });
      }

      if (!product.currentWinnerId) {
        return res.status(400).json({
          success: false,
          message: "Không có người thắng hiện tại",
        });
      }

      // Get unique bidders sorted by amount (excluding current winner)
      const uniqueBidders = [];
      const seenBidders = new Set([product.currentWinnerId]);

      for (const bid of product.bids) {
        if (!seenBidders.has(bid.bidderId)) {
          uniqueBidders.push(bid);
          seenBidders.add(bid.bidderId);
        }
      }

      if (uniqueBidders.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Không có người đấu giá thứ 2 để chuyển đổi",
        });
      }

      const nextWinner = uniqueBidders[0];
      const oldWinnerId = product.currentWinnerId;

      // Update product with new winner
      await prisma.product.update({
        where: { id: productId },
        data: {
          currentWinnerId: nextWinner.bidderId,
          currentPrice: nextWinner.amount,
        },
      });

      // Update or create order
      if (product.order) {
        await prisma.order.update({
          where: { id: product.order.id },
          data: {
            buyerId: nextWinner.bidderId,
            finalPrice: nextWinner.amount,
          },
        });
      }

      // Create automatic -1 rating for rejected winner
      if (product.order) {
        await prisma.rating.create({
          data: {
            orderId: product.order.id,
            fromUserId: userId,
            toUserId: oldWinnerId,
            type: "NEGATIVE",
            comment: reason.trim(),
          },
        });

        // Update old winner's negative rating count
        await prisma.user.update({
          where: { id: oldWinnerId },
          data: { negativeRatings: { increment: 1 } },
        });
      }

      return res.json({
        success: true,
        message:
          "Đã từ chối người thắng và chuyển sang người đấu giá cao thứ 2",
        data: {
          newWinner: nextWinner.bidder,
          newPrice: nextWinner.amount,
        },
      });
    } catch (error) {
      console.error("Error rejecting winner:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  },

  /**
   * Get list of bidders for a product
   */
  getBidders: async (req, res) => {
    try {
      const { id: productId } = req.params;
      const userId = req.user.id;

      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          bids: {
            orderBy: { amount: "desc" },
            include: {
              bidder: {
                select: {
                  id: true,
                  fullName: true,
                  positiveRatings: true,
                  negativeRatings: true,
                },
              },
            },
          },
        },
      });

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Sản phẩm không tồn tại" });
      }

      const isSeller = product.sellerId === userId;
      const isBuyer = product.currentWinnerId === userId;

      if (!isSeller && !isBuyer) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xem danh sách người đấu giá",
        });
      }

      // Get unique bidders (highest bid per bidder)
      const uniqueBidders = [];
      const seenBidders = new Set();

      for (const bid of product.bids) {
        if (!seenBidders.has(bid.bidderId)) {
          uniqueBidders.push({
            id: bid.bidderId,
            fullName: bid.bidder.fullName,
            amount: bid.amount.toString(),
            createdAt: bid.createdAt,
            positiveRatings: bid.bidder.positiveRatings,
            negativeRatings: bid.bidder.negativeRatings,
            isCurrentWinner: bid.bidderId === product.currentWinnerId,
          });
          seenBidders.add(bid.bidderId);
        }
      }

      return res.json({
        success: true,
        data: uniqueBidders,
      });
    } catch (error) {
      console.error("Error getting bidders:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  },

  /**
   * Submit or edit rating
   */
  submitRating: async (req, res) => {
    try {
      const { id: productId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.id;

      if (!rating || ![1, -1].includes(rating)) {
        return res.status(400).json({
          success: false,
          message: "Đánh giá phải là +1 hoặc -1",
        });
      }

      if (!comment || comment.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: "Nhận xét phải có ít nhất 10 ký tự",
        });
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Sản phẩm không tồn tại" });
      }

      if (product.status !== "DELIVERED" && product.status !== "COMPLETED") {
        return res.status(400).json({
          success: false,
          message: "Chỉ có thể đánh giá sau khi nhận hàng",
        });
      }

      const isSeller = product.sellerId === userId;
      const isBuyer = product.currentWinnerId === userId;

      if (!isSeller && !isBuyer) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền đánh giá",
        });
      }

      const targetUserId = isSeller
        ? product.currentWinnerId
        : product.sellerId;

      // Get or create order
      let order = await prisma.order.findUnique({
        where: { productId: productId },
      });

      if (!order) {
        order = await prisma.order.create({
          data: {
            productId: productId,
            buyerId: product.currentWinnerId,
            sellerId: product.sellerId,
            finalPrice: product.currentPrice,
            status: "PENDING_PAYMENT",
          },
        });
      }

      // Convert rating number to enum
      const ratingType = rating === 1 ? "POSITIVE" : "NEGATIVE";

      // Check if rating exists
      const existingRating = await prisma.rating.findFirst({
        where: {
          orderId: order.id,
          fromUserId: userId,
        },
      });

      if (existingRating) {
        // Update existing rating
        const oldType = existingRating.type;

        await prisma.rating.update({
          where: { id: existingRating.id },
          data: {
            type: ratingType,
            comment: comment.trim(),
          },
        });

        // Update target user's rating counts
        if (oldType !== ratingType) {
          if (oldType === "POSITIVE") {
            await prisma.user.update({
              where: { id: targetUserId },
              data: { positiveRatings: { decrement: 1 } },
            });
          } else {
            await prisma.user.update({
              where: { id: targetUserId },
              data: { negativeRatings: { decrement: 1 } },
            });
          }

          if (ratingType === "POSITIVE") {
            await prisma.user.update({
              where: { id: targetUserId },
              data: { positiveRatings: { increment: 1 } },
            });
          } else {
            await prisma.user.update({
              where: { id: targetUserId },
              data: { negativeRatings: { increment: 1 } },
            });
          }
        }

        return res.json({
          success: true,
          message: "Đã cập nhật đánh giá thành công",
        });
      } else {
        // Create new rating
        await prisma.rating.create({
          data: {
            orderId: order.id,
            fromUserId: userId,
            toUserId: targetUserId,
            type: ratingType,
            comment: comment.trim(),
          },
        });

        // Update target user's rating count
        if (ratingType === "POSITIVE") {
          await prisma.user.update({
            where: { id: targetUserId },
            data: { positiveRatings: { increment: 1 } },
          });
        } else {
          await prisma.user.update({
            where: { id: targetUserId },
            data: { negativeRatings: { increment: 1 } },
          });
        }

        // Check if both parties have rated
        const allRatings = await prisma.rating.findMany({
          where: { orderId: order.id },
        });

        if (allRatings.length === 2) {
          // Both rated, mark as completed
          await prisma.product.update({
            where: { id: productId },
            data: { status: "COMPLETED" },
          });

          await prisma.order.update({
            where: { id: order.id },
            data: { status: "COMPLETED" },
          });
        }

        return res.json({
          success: true,
          message: "Đã gửi đánh giá thành công",
        });
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  },

  /**
   * Get ratings for a product
   */
  getRatings: async (req, res) => {
    try {
      const { id: productId } = req.params;
      const userId = req.user.id;

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Sản phẩm không tồn tại" });
      }

      const isSeller = product.sellerId === userId;
      const isBuyer = product.currentWinnerId === userId;

      if (!isSeller && !isBuyer) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xem đánh giá",
        });
      }

      // Get order first
      const order = await prisma.order.findUnique({
        where: { productId: productId },
      });

      if (!order) {
        return res.json({ success: true, data: [] });
      }

      const ratings = await prisma.rating.findMany({
        where: { orderId: order.id },
        include: {
          fromUser: {
            select: { id: true, fullName: true },
          },
          toUser: {
            select: { id: true, fullName: true },
          },
        },
      });

      // Convert type enum back to rating number for frontend compatibility
      const formattedRatings = ratings.map((r) => ({
        id: r.id,
        fromUserId: r.fromUserId,
        toUserId: r.toUserId,
        rating: r.type === "POSITIVE" ? 1 : -1,
        comment: r.comment,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));

      return res.json({
        success: true,
        data: formattedRatings,
      });
    } catch (error) {
      console.error("Error getting ratings:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  },

  /**
   * Send chat message
   */
  sendMessage: async (req, res) => {
    try {
      const { id: productId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Nội dung tin nhắn không được để trống",
        });
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { order: true },
      });

      console.log("Product fetched for messaging:", product);

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Sản phẩm không tồn tại" });
      }

      console.log("Current seller ID:", product.sellerId, "User ID:", userId);
      const isSeller = product.sellerId === userId;
      console.log(
        "Current Winner ID:",
        product.currentWinnerId,
        "User ID:",
        userId
      );
      const isBuyer = product.currentWinnerId === userId;

      if (!isSeller && !isBuyer) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền gửi tin nhắn",
        });
      }

      // Ensure order exists
      let orderId = product.order?.id;
      if (!orderId) {
        const newOrder = await prisma.order.create({
          data: {
            productId: productId,
            buyerId: product.currentWinnerId,
            sellerId: product.sellerId,
            finalPrice: product.currentPrice,
            status: "PENDING_PAYMENT",
          },
        });
        orderId = newOrder.id;
      }

      const message = await prisma.chatMessage.create({
        data: {
          orderId: orderId,
          senderId: userId,
          content: content.trim(),
        },
        include: {
          sender: {
            select: { id: true, fullName: true },
          },
        },
      });

      return res.json({
        success: true,
        data: {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          senderName: message.sender.fullName,
          createdAt: message.createdAt,
        },
      });
    } catch (error) {
      console.error("Error sending message:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  },

  /**
   * Get chat messages
   */
  getMessages: async (req, res) => {
    try {
      const { id: productId } = req.params;
      const userId = req.user.id;

      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { order: true },
      });

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Sản phẩm không tồn tại" });
      }

      console.log("Current seller ID:", product.sellerId, "User ID:", userId);
      const isSeller = product.sellerId === userId;
      console.log(
        "Current Winner ID:",
        product.currentWinnerId,
        "User ID:",
        userId
      );
      const isBuyer = product.currentWinnerId === userId;

      if (!isSeller && !isBuyer) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xem tin nhắn",
        });
      }

      if (!product.order) {
        return res.json({ success: true, data: [] });
      }

      const messages = await prisma.chatMessage.findMany({
        where: { orderId: product.order.id },
        include: {
          sender: {
            select: { id: true, fullName: true },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      const formattedMessages = messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId,
        senderName: msg.sender.fullName,
        createdAt: msg.createdAt,
      }));

      return res.json({
        success: true,
        data: formattedMessages,
      });
    } catch (error) {
      console.error("Error getting messages:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  },
};

export default orderController;
