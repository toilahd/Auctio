// controllers/paymentController.js
import { getLogger } from "../config/logger.js";
import prisma from "../config/prisma.js";

const logger = getLogger("PaymentController");

class PaymentController {
  /**
   * Handle seller upgrade payment callback
   * POST /api/payment/seller-upgrade-callback
   */
  async sellerUpgradeCallback(req, res) {
    /*
      #swagger.summary = 'Seller upgrade payment callback'
      #swagger.description = 'Mock payment callback for seller upgrade (simulates ZaloPay gateway)'
      #swagger.tags = ['Payment']
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Payment callback data',
        required: true,
        schema: {
          userId: 'user-uuid',
          amount: 500000,
          transactionId: 'MOCK_1234567890',
          paymentMethod: 'ZaloPay',
          status: 'SUCCESS'
        }
      }
      #swagger.responses[200] = {
        description: 'Payment processed successfully',
        schema: {
          success: true,
          message: 'User upgraded to seller successfully'
        }
      }
      #swagger.responses[400] = {
        description: 'Invalid payment data',
        schema: { success: false, message: 'Invalid payment data' }
      }
    */
    try {
      const { userId, amount, transactionId, paymentMethod, status } = req.body;

      // Validate required fields
      if (!userId || !amount || !transactionId || !status) {
        return res.status(400).json({
          success: false,
          message: "Missing required payment fields",
        });
      }

      // Check if payment was successful
      if (status !== "SUCCESS") {
        return res.status(400).json({
          success: false,
          message: "Payment was not successful",
        });
      }

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check if user is already a seller
      if (user.role === "SELLER" || user.role === "ADMIN") {
        return res.status(400).json({
          success: false,
          message: "User is already a seller",
        });
      }

      // Calculate expiration date (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Upgrade user to seller and record transaction
      const [updatedUser] = await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: {
            role: "SELLER",
            upgradeRequested: true,
            upgradeRequestedAt: new Date(),
            upgradeStatus: "APPROVED",
          },
        }),
        // Create a payment record (if you have a Payment model)
        // prisma.payment.create({
        //   data: {
        //     userId,
        //     amount,
        //     transactionId,
        //     paymentMethod,
        //     status,
        //     purpose: 'SELLER_UPGRADE',
        //     expiresAt
        //   }
        // })
      ]);

      logger.info(`User ${userId} upgraded to SELLER via payment ${transactionId}`);

      return res.status(200).json({
        success: true,
        message: "User upgraded to seller successfully",
        data: {
          userId: updatedUser.id,
          role: updatedUser.role,
          expiresAt,
        },
      });
    } catch (error) {
      logger.error("Error in sellerUpgradeCallback:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to process payment callback",
      });
    }
  }
}

export default new PaymentController();
