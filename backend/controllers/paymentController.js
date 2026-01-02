// controllers/paymentController.js
import { getLogger } from "../config/logger.js";
import prisma from "../config/prisma.js";
import zalopayService from "../services/zalopayService.js";
import stripeService from "../services/stripeService.js";

const logger = getLogger("PaymentController");

class PaymentController {
  /**
   * Create ZaloPay order for seller upgrade
   * POST /api/payment/seller-upgrade/create
   */
  async createSellerUpgradeOrder(req, res) {
    /*
      #swagger.summary = 'Create ZaloPay payment order for seller upgrade'
      #swagger.description = 'Generate ZaloPay payment URL for seller upgrade'
      #swagger.tags = ['Payment']
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'User ID for seller upgrade',
        required: true,
        schema: {
          userId: 'user-uuid'
        }
      }
      #swagger.responses[200] = {
        description: 'Payment order created successfully',
        schema: {
          success: true,
          data: {
            order_url: 'https://qcgateway.zalopay.vn/...',
            app_trans_id: '231231_SELLER_123456'
          }
        }
      }
    */
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      // Verify user exists and is not already a seller
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.role === "SELLER" || user.role === "ADMIN") {
        return res.status(400).json({
          success: false,
          message: "User is already a seller",
        });
      }

      // Create ZaloPay order
      const paymentOrder = await zalopayService.createSellerUpgradeOrder(
        userId,
        500000 // 500,000 VND
      );

      logger.info(
        `ZaloPay order created for user ${userId}:`,
        paymentOrder.app_trans_id
      );

      return res.status(200).json({
        success: true,
        data: {
          order_url: paymentOrder.order_url,
          app_trans_id: paymentOrder.app_trans_id,
          zp_trans_token: paymentOrder.zp_trans_token,
        },
      });
    } catch (error) {
      logger.error("Error creating seller upgrade order:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to create payment order",
      });
    }
  }

  /**
   * Handle ZaloPay callback for seller upgrade
   * POST /api/payment/zalopay-callback
   */
  async zalopayCallback(req, res) {
    /*
      #swagger.summary = 'ZaloPay payment callback webhook'
      #swagger.description = 'Webhook endpoint for ZaloPay to notify payment status'
      #swagger.tags = ['Payment']
    */
    try {
      const callbackData = req.body;

      logger.info("Received ZaloPay callback:", callbackData);

      // Verify callback signature
      if (!zalopayService.verifyCallback(callbackData)) {
        logger.warn("Invalid ZaloPay callback signature");
        return res.status(400).json({
          return_code: -1,
          return_message: "Invalid signature",
        });
      }

      // Parse callback data
      const data = JSON.parse(callbackData.data);
      const embedData = JSON.parse(data.embed_data);
      const merchantInfo = JSON.parse(embedData.merchantinfo);

      logger.info("Parsed callback data:", { data, merchantInfo });

      // Handle different payment types
      if (merchantInfo.type === "SELLER_UPGRADE") {
        await this.handleSellerUpgradePayment(data, merchantInfo);
      } else if (merchantInfo.type === "AUCTION_PAYMENT") {
        await this.handleAuctionPayment(data, merchantInfo);
      }

      // Respond to ZaloPay
      return res.status(200).json({
        return_code: 1,
        return_message: "success",
      });
    } catch (error) {
      logger.error("Error in zalopayCallback:", error);
      return res.status(200).json({
        return_code: 0,
        return_message: error.message,
      });
    }
  }

  /**
   * Handle seller upgrade payment processing
   */
  async handleSellerUpgradePayment(data, merchantInfo) {
    const { userId } = merchantInfo;
    const { app_trans_id, amount } = data;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || user.role === "SELLER" || user.role === "ADMIN") {
        logger.warn(`Invalid seller upgrade for user ${userId}`);
        return;
      }

      // Upgrade user to seller
      await prisma.user.update({
        where: { id: userId },
        data: {
          role: "SELLER",
          upgradeRequested: true,
          upgradeRequestedAt: new Date(),
          upgradeStatus: "APPROVED",
        },
      });

      logger.info(
        `User ${userId} upgraded to SELLER via transaction ${app_trans_id}`
      );
    } catch (error) {
      logger.error("Error handling seller upgrade payment:", error);
      throw error;
    }
  }

  /**
   * Handle auction payment processing
   */
  async handleAuctionPayment(data, merchantInfo) {
    const { orderId, buyerId } = merchantInfo;
    const { app_trans_id, amount } = data;

    try {
      // Update order status to PAID
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });

      logger.info(
        `Order ${orderId} marked as PAID via transaction ${app_trans_id}`
      );
    } catch (error) {
      logger.error("Error handling auction payment:", error);
      throw error;
    }
  }

  /**
   * Create ZaloPay order for auction payment
   * POST /api/payment/auction/create
   */
  async createAuctionPaymentOrder(req, res) {
    /*
      #swagger.summary = 'Create ZaloPay payment order for auction'
      #swagger.description = 'Generate ZaloPay payment URL for auction winner payment'
      #swagger.tags = ['Payment']
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Order details',
        required: true,
        schema: {
          orderId: 'order-uuid',
          buyerId: 'user-uuid',
          amount: 1000000,
          productTitle: 'Product name'
        }
      }
    */
    try {
      const { orderId, buyerId, amount, productTitle } = req.body;

      if (!orderId || !buyerId || !amount || !productTitle) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      // Verify order exists
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          product: true,
        },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      if (order.buyerId !== buyerId) {
        return res.status(403).json({
          success: false,
          message: "Not authorized for this order",
        });
      }

      // Create ZaloPay order
      const paymentOrder = await zalopayService.createAuctionPaymentOrder(
        orderId,
        buyerId,
        amount,
        productTitle
      );

      logger.info(
        `ZaloPay order created for auction ${orderId}:`,
        paymentOrder.app_trans_id
      );

      return res.status(200).json({
        success: true,
        data: {
          order_url: paymentOrder.order_url,
          app_trans_id: paymentOrder.app_trans_id,
          zp_trans_token: paymentOrder.zp_trans_token,
        },
      });
    } catch (error) {
      logger.error("Error creating auction payment order:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to create payment order",
      });
    }
  }

  /**
   * Mock callback for testing (deprecated - use real ZaloPay callback)
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

      logger.info(
        `User ${userId} upgraded to SELLER via payment ${transactionId}`
      );

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

  // =====================
  // STRIPE PAYMENT METHODS
  // =====================

  /**
   * Create Stripe PaymentIntent for auction payment
   * POST /api/payment/stripe/auction/create
   */
  async createStripeAuctionPayment(req, res) {
    /*
      #swagger.summary = 'Create Stripe payment intent for auction payment'
      #swagger.description = 'Generate Stripe PaymentIntent for winning bidder to pay for auction'
      #swagger.tags = ['Payment']
      #swagger.security = [{ "bearerAuth": [] }]
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Product ID for the won auction',
        required: true,
        schema: {
          productId: 'product-uuid'
        }
      }
      #swagger.responses[200] = {
        description: 'Payment intent created successfully',
        schema: {
          success: true,
          data: {
            clientSecret: 'pi_1Fxxxx_secret_XXXX',
            paymentIntentId: 'pi_1Fxxxx',
            amount: 250000,
            currency: 'vnd',
            orderId: 'order-uuid'
          }
        }
      }
      #swagger.responses[400] = {
        description: 'Invalid request or auction not ended',
        schema: { success: false, message: 'Product ID is required' }
      }
      #swagger.responses[403] = {
        description: 'User is not the auction winner',
        schema: { success: false, message: 'You are not the winner of this auction' }
      }
      #swagger.responses[404] = {
        description: 'Product not found',
        schema: { success: false, message: 'Product not found' }
      }
      #swagger.responses[500] = {
        description: 'Failed to create payment',
        schema: { success: false, message: 'Failed to create payment' }
      }
    */
    try {
      const { productId } = req.body;
      const userId = req.user.id;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
      }

      // Get product details
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          seller: true,
          currentWinner: true,
        },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (product.currentWinnerId !== userId) {
        return res.status(403).json({
          success: false,
          message: "You are not the winner of this auction",
        });
      }

      if (product.status !== "ENDED") {
        return res.status(400).json({
          success: false,
          message: "Auction has not ended yet",
        });
      }

      // Get or create order
      let order = await prisma.order.findUnique({
        where: { productId: productId },
      });

      if (!order) {
        order = await prisma.order.create({
          data: {
            productId: productId,
            buyerId: userId,
            sellerId: product.sellerId,
            finalPrice: product.currentPrice,
            status: "PENDING_PAYMENT",
          },
        });
      }

      // Create Stripe PaymentIntent
      const paymentIntent = await stripeService.createAuctionPaymentIntent(
        order.id,
        product.id,
        userId,
        Math.max(parseFloat(product.currentPrice), 20000),
        product.title
      );

      logger.info(
        `Stripe PaymentIntent created for order ${order.id}: ${paymentIntent.paymentIntentId}`
      );

      return res.status(200).json({
        success: true,
        data: {
          clientSecret: paymentIntent.clientSecret,
          paymentIntentId: paymentIntent.paymentIntentId,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          orderId: order.id,
        },
      });
    } catch (error) {
      logger.error("Error creating Stripe auction payment:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to create payment",
      });
    }
  }

  /**
   * Create Stripe PaymentIntent for seller upgrade
   * POST /api/payment/stripe/seller-upgrade/create
   */
  async createStripeSellerUpgrade(req, res) {
    /*
      #swagger.summary = 'Create Stripe payment intent for seller upgrade'
      #swagger.description = 'Generate Stripe PaymentIntent for upgrading user to seller'
      #swagger.tags = ['Payment']
      #swagger.security = [{ "bearerAuth": [] }]
      #swagger.responses[200] = {
        description: 'Payment intent created successfully',
        schema: {
          success: true,
          data: {
            clientSecret: 'pi_1Fxxxx_secret_XXXX',
            paymentIntentId: 'pi_1Fxxxx',
            amount: 100000,
            currency: 'vnd'
          }
        }
      }
      #swagger.responses[400] = {
        description: 'User is already a seller or admin',
        schema: { success: false, message: 'User is already a seller or admin' }
      }
      #swagger.responses[500] = {
        description: 'Failed to create payment',
        schema: { success: false, message: 'Failed to create payment' }
      }
    */
    try {
      const userId = req.user.id;
      const SELLER_UPGRADE_AMOUNT = 100000; // 100,000 VND

      // Verify user exists and is not already a seller
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.role === "SELLER" || user.role === "ADMIN") {
        return res.status(400).json({
          success: false,
          message: "User is already a seller or admin",
        });
      }

      // Create Stripe PaymentIntent
      const paymentIntent = await stripeService.createSellerUpgradeIntent(
        userId,
        SELLER_UPGRADE_AMOUNT
      );

      logger.info(
        `Stripe PaymentIntent created for seller upgrade user ${userId}: ${paymentIntent.paymentIntentId}`
      );

      return res.status(200).json({
        success: true,
        data: {
          clientSecret: paymentIntent.clientSecret,
          paymentIntentId: paymentIntent.paymentIntentId,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
      });
    } catch (error) {
      logger.error("Error creating Stripe seller upgrade:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to create payment",
      });
    }
  }

  /**
   * Stripe webhook handler
   * POST /api/payment/stripe/webhook
   */
  async stripeWebhook(req, res) {
    /*
      #swagger.summary = 'Stripe webhook endpoint'
      #swagger.description = 'Webhook endpoint for Stripe to notify payment status changes. Signature is verified automatically.'
      #swagger.tags = ['Payment']
      #swagger.parameters['stripe-signature'] = {
        in: 'header',
        description: 'Stripe webhook signature for verification',
        required: true,
        type: 'string'
      }
      #swagger.requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'evt_1Fxxxx' },
                type: { type: 'string', example: 'payment_intent.succeeded' },
                data: { type: 'object' }
              }
            }
          }
        }
      }
      #swagger.responses[200] = {
        description: 'Webhook received and processed',
        schema: { received: true }
      }
      #swagger.responses[400] = {
        description: 'Invalid webhook signature',
        schema: { success: false, message: 'Invalid signature' }
      }
      #swagger.responses[500] = {
        description: 'Error processing webhook',
        schema: { success: false, message: 'Error message' }
      }
    */
    console.log("Stripe webhook received");
    try {
      const signature = req.headers["stripe-signature"];
      // express.raw() puts the raw body in req.body as a Buffer
      // Convert Buffer to string for Stripe verification
      const payload = Buffer.isBuffer(req.body)
        ? req.body.toString("utf8")
        : req.body;

      // Verify webhook signature
      let event;
      try {
        event = stripeService.verifyWebhookSignature(payload, signature);
      } catch (error) {
        logger.warn("Stripe webhook signature verification failed");
        return res.status(400).json({
          success: false,
          message: "Invalid signature",
        });
      }

      logger.info(`Stripe webhook received: ${event.type}`);

      // Handle the event
      switch (event.type) {
        case "payment_intent.succeeded":
          console.log("Handling payment succeeded event");
          await paymentController.handleStripePaymentSuccess(event.data.object);
          break;
        case "payment_intent.payment_failed":
          console.log("Handling payment failed event");
          await paymentController.handleStripePaymentFailed(event.data.object);
          break;
        default:
          logger.info(`Unhandled Stripe event type: ${event.type}`);
      }

      // Return success response to Stripe
      return res.status(200).json({ received: true });
    } catch (error) {
      logger.error("Error handling Stripe webhook:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Handle successful Stripe payment
   */
  async handleStripePaymentSuccess(paymentIntent) {
    console.log("Handling Stripe payment success");
    try {
      const { id: paymentIntentId, metadata, amount } = paymentIntent;
      const { type, orderId, userId, productId } = metadata;

      logger.info(
        `Processing Stripe payment success: ${paymentIntentId}, type: ${type}`
      );

      if (type === "AUCTION_PAYMENT") {
        console.log("Updating order and product status for auction payment");
        // Update order status
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "PAID",
            isPaid: true,
            paidAt: new Date(),
            paymentMethod: "STRIPE",
            paymentTransactionId: paymentIntentId,
          },
        });

        // Update product status to PAID
        await prisma.product.update({
          where: { id: productId },
          data: { status: "PAYED" },
        });

        logger.info(
          `Order ${orderId} marked as PAID via Stripe ${paymentIntentId}`
        );
      } else if (type === "SELLER_UPGRADE") {
        // Upgrade user to seller
        await prisma.user.update({
          where: { id: userId },
          data: {
            upgradeRequested: true,
            upgradeRequestedAt: new Date(),
            upgradeStatus: "PENDING",
          },
        });

        logger.info(
          `User ${userId} upgraded to SELLER via Stripe ${paymentIntentId}`
        );
      }
    } catch (error) {
      logger.error("Error handling Stripe payment success:", error);
      throw error;
    }
  }

  /**
   * Handle failed Stripe payment
   */
  async handleStripePaymentFailed(paymentIntent) {
    try {
      const { id: paymentIntentId, metadata } = paymentIntent;
      const { type, orderId } = metadata;

      logger.warn(`Stripe payment failed: ${paymentIntentId}, type: ${type}`);

      if (type === "AUCTION_PAYMENT" && orderId) {
        // Optionally update order status or send notification
        logger.info(`Payment failed for order ${orderId}`);
      }
    } catch (error) {
      logger.error("Error handling Stripe payment failure:", error);
      throw error;
    }
  }
}

const paymentController = new PaymentController();
export default paymentController;
