// routes/paymentRoutes.js
import express from "express";
import paymentController from "../controllers/paymentController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Note: Stripe webhook is mounted in app.js before body parsers to preserve raw body

// ZaloPay - Seller upgrade payment
router.post(
  "/seller-upgrade/create",
  authenticate,
  paymentController.createSellerUpgradeOrder
);

// ZaloPay - Auction payment
router.post(
  "/auction/create",
  authenticate,
  paymentController.createAuctionPaymentOrder
);

// ZaloPay callback webhook (no auth - called by ZaloPay)
router.post("/zalopay-callback", paymentController.zalopayCallback);

// Stripe - Auction payment
router.post(
  "/stripe/auction/create",
  authenticate,
  paymentController.createStripeAuctionPayment
);

// Stripe - Seller upgrade payment
router.post(
  "/stripe/seller-upgrade/create",
  authenticate,
  paymentController.createStripeSellerUpgrade
);

// Mock payment callback for seller upgrade (deprecated - use ZaloPay)
router.post(
  "/seller-upgrade-callback",
  paymentController.sellerUpgradeCallback
);

export default router;
