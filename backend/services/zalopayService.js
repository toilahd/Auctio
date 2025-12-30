// services/zalopayService.js
import crypto from "crypto";
import { getLogger } from "../config/logger.js";

const logger = getLogger("ZaloPayService");

class ZaloPayService {
  constructor() {
    this.endpoint =
      process.env.ZALOPAY_ENDPOINT || "https://sb-openapi.zalopay.vn/v2/create";
    this.appId = process.env.ZALOPAY_APPID;
    this.key1 = process.env.ZALOPAY_KEY1;
    this.key2 = process.env.ZALOPAY_KEY2;

    if (!this.appId || !this.key1) {
      logger.warn("ZaloPay credentials not configured. Payment will fail.");
    }
  }

  /**
   * Create payment order for seller upgrade
   * @param {string} userId - User ID
   * @param {number} amount - Payment amount in VND
   * @returns {Promise<{order_url: string, app_trans_id: string, zp_trans_token: string}>}
   */
  async createSellerUpgradeOrder(userId, amount = 500000) {
    try {
      const appTime = Date.now();
      const appTransId = this.generateTransactionId("SELLER");

      const embedData = {
        redirecturl: `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/payment-result?type=seller`,
        merchantinfo: JSON.stringify({
          type: "SELLER_UPGRADE",
          userId: userId,
        }),
      };

      const items = [
        {
          itemid: "seller_upgrade",
          itemname: "Nâng cấp tài khoản Seller - 7 ngày",
          itemprice: amount,
          itemquantity: 1,
        },
      ];

      const order = {
        app_id: this.appId,
        app_trans_id: appTransId,
        app_user: userId,
        app_time: appTime,
        amount: amount,
        embed_data: JSON.stringify(embedData),
        item: JSON.stringify(items),
        bank_code: "",
        description: `Nâng cấp Seller cho user ${userId}`,
      };

      // Generate MAC
      const macData = [
        order.app_id,
        order.app_trans_id,
        order.app_user,
        order.amount,
        order.app_time,
        order.embed_data,
        order.item,
      ].join("|");

      order.mac = crypto
        .createHmac("sha256", this.key1)
        .update(macData)
        .digest("hex");

      logger.info("Creating ZaloPay order:", { appTransId });

      const formBody = new URLSearchParams(order).toString();
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody,
      });

      const data = await response.json();
      logger.info("ZaloPay response:", data);

      if (data.return_code === 1) {
        return {
          success: true,
          order_url: data.order_url,
          app_trans_id: appTransId,
          zp_trans_token: data.zp_trans_token,
        };
      } else {
        throw new Error(data.return_message || "Failed to create payment");
      }
    } catch (error) {
      logger.error("Error creating ZaloPay order:", error);
      throw error;
    }
  }

  /**
   * Create payment order for auction payment
   * @param {string} orderId - Order ID
   * @param {string} buyerId - Buyer user ID
   * @param {number} amount - Payment amount in VND
   * @param {string} productTitle - Product title
   * @returns {Promise<{order_url: string, app_trans_id: string, zp_trans_token: string}>}
   */
  async createAuctionPaymentOrder(orderId, buyerId, amount, productTitle) {
    try {
      const appTime = Date.now();
      const appTransId = this.generateTransactionId("AUCTION");

      const embedData = {
        redirecturl: `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/payment-result?type=auction`,
        merchantinfo: JSON.stringify({
          type: "AUCTION_PAYMENT",
          orderId: orderId,
          buyerId: buyerId,
        }),
      };

      const items = [
        {
          itemid: orderId,
          itemname: productTitle.substring(0, 50), // ZaloPay limit
          itemprice: amount,
          itemquantity: 1,
        },
      ];

      const order = {
        app_id: this.appId,
        app_trans_id: appTransId,
        app_user: buyerId,
        app_time: appTime,
        amount: amount,
        embed_data: JSON.stringify(embedData),
        item: JSON.stringify(items),
        bank_code: "",
        description: `Thanh toán đấu giá: ${productTitle.substring(0, 50)}`,
      };

      // Generate MAC
      const macData = [
        order.app_id,
        order.app_trans_id,
        order.app_user,
        order.amount,
        order.app_time,
        order.embed_data,
        order.item,
      ].join("|");

      order.mac = crypto
        .createHmac("sha256", this.key1)
        .update(macData)
        .digest("hex");

      logger.info("Creating ZaloPay order for auction:", {
        appTransId,
        orderId,
      });

      const formBody = new URLSearchParams(order).toString();
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody,
      });

      const data = await response.json();
      logger.info("ZaloPay response:", data);

      if (data.return_code === 1) {
        return {
          success: true,
          order_url: data.order_url,
          app_trans_id: appTransId,
          zp_trans_token: data.zp_trans_token,
        };
      } else {
        throw new Error(data.return_message || "Failed to create payment");
      }
    } catch (error) {
      logger.error("Error creating ZaloPay order:", error);
      throw error;
    }
  }

  /**
   * Verify callback from ZaloPay
   * @param {Object} callbackData - Data from ZaloPay callback
   * @returns {boolean} - Whether the callback is valid
   */
  verifyCallback(callbackData) {
    try {
      const { data, mac } = callbackData;

      const computedMac = crypto
        .createHmac("sha256", this.key2)
        .update(data)
        .digest("hex");

      return mac === computedMac;
    } catch (error) {
      logger.error("Error verifying callback:", error);
      return false;
    }
  }

  /**
   * Generate unique transaction ID
   * @param {string} type - Transaction type prefix
   * @returns {string} - Transaction ID in format yymmdd_TYPE_timestamp
   */
  generateTransactionId(type) {
    const date = new Date();
    const yymmdd = date.toISOString().slice(2, 10).replace(/-/g, "");
    const timestamp = Date.now().toString().slice(-6);
    return `${yymmdd}_${type}_${timestamp}`;
  }
}

export default new ZaloPayService();
