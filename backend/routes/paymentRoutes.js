// routes/paymentRoutes.js
import express from "express";
import paymentController from "../controllers/paymentController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ZaloPay - Seller upgrade payment
router.post("/seller-upgrade/create", verifyToken, paymentController.createSellerUpgradeOrder);

// ZaloPay - Auction payment
router.post("/auction/create", verifyToken, paymentController.createAuctionPaymentOrder);

// ZaloPay callback webhook (no auth - called by ZaloPay)
router.post("/zalopay-callback", paymentController.zalopayCallback);

// Mock payment callback for seller upgrade (deprecated - use ZaloPay)
router.post("/seller-upgrade-callback", paymentController.sellerUpgradeCallback);

export default router;
