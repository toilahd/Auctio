// routes/paymentRoutes.js
import express from "express";
import paymentController from "../controllers/paymentController.js";

const router = express.Router();

// Mock payment callback for seller upgrade
router.post("/seller-upgrade-callback", paymentController.sellerUpgradeCallback);

export default router;
