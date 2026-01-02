// services/stripeService.js
import Stripe from "stripe";
import dotenv from "dotenv";
import logger from "../config/logger.js";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const stripeService = {
  /**
   * Create a PaymentIntent for auction payment
   * @param {string} orderId - Order ID
   * @param {string} productId - Product ID
   * @param {string} buyerId - Buyer user ID
   * @param {number} amount - Amount in VND (will be converted to smallest currency unit)
   * @param {string} productTitle - Product title for description
   * @returns {Promise<object>} PaymentIntent with client_secret
   */
  async createAuctionPaymentIntent(
    orderId,
    productId,
    buyerId,
    amount,
    productTitle
  ) {
    try {
      // Stripe requires amount in smallest currency unit (cents for USD, etc.)
      // For VND, the smallest unit is 1 VND
      const amountInSmallestUnit = Math.round(amount);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInSmallestUnit,
        currency: "vnd", // Vietnamese Dong
        description: `Thanh toán đấu giá: ${productTitle}`,
        metadata: {
          orderId,
          productId,
          buyerId,
          type: "AUCTION_PAYMENT",
        },
        // Automatically confirm the payment (recommended for most use cases)
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info(
        `Stripe PaymentIntent created: ${paymentIntent.id} for order ${orderId}`
      );

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      };
    } catch (error) {
      logger.error("Error creating Stripe PaymentIntent:", error);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  },

  /**
   * Create a PaymentIntent for seller upgrade
   * @param {string} userId - User ID requesting upgrade
   * @param {number} amount - Amount in VND
   * @returns {Promise<object>} PaymentIntent with client_secret
   */
  async createSellerUpgradeIntent(userId, amount) {
    try {
      const amountInSmallestUnit = Math.round(amount);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInSmallestUnit,
        currency: "vnd",
        description: "Nâng cấp tài khoản thành Seller",
        metadata: {
          userId,
          type: "SELLER_UPGRADE",
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info(
        `Stripe PaymentIntent created: ${paymentIntent.id} for seller upgrade user ${userId}`
      );

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      };
    } catch (error) {
      logger.error("Error creating Stripe seller upgrade intent:", error);
      throw new Error(
        `Failed to create seller upgrade intent: ${error.message}`
      );
    }
  },

  /**
   * Verify Stripe webhook signature
   * @param {string} payload - Raw request body
   * @param {string} signature - Stripe-Signature header
   * @returns {object} Verified webhook event
   */
  verifyWebhookSignature(payload, signature) {
    console.log(
      "Secret used for verification:",
      process.env.STRIPE_WEBHOOK_SECRET
    );
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      return event;
    } catch (error) {
      logger.error("Stripe webhook signature verification failed:", error);
      throw new Error(
        `Webhook signature verification failed: ${error.message}`
      );
    }
  },

  /**
   * Retrieve a PaymentIntent
   * @param {string} paymentIntentId - PaymentIntent ID
   * @returns {Promise<object>} PaymentIntent object
   */
  async getPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );
      return paymentIntent;
    } catch (error) {
      logger.error("Error retrieving PaymentIntent:", error);
      throw new Error(`Failed to retrieve payment intent: ${error.message}`);
    }
  },

  /**
   * Cancel a PaymentIntent
   * @param {string} paymentIntentId - PaymentIntent ID
   * @returns {Promise<object>} Cancelled PaymentIntent
   */
  async cancelPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
      logger.info(`PaymentIntent cancelled: ${paymentIntentId}`);
      return paymentIntent;
    } catch (error) {
      logger.error("Error cancelling PaymentIntent:", error);
      throw new Error(`Failed to cancel payment intent: ${error.message}`);
    }
  },
};

export default stripeService;
