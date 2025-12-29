// routes/userRoutes.js
import express from "express";
import userController from "../controllers/userController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import getUserFromJwt from "../utils/getUserFromJwtMiddleware.js";

const router = express.Router();

// All routes require authentication
// router.use(authenticate);
router.use(getUserFromJwt);

router.get("/profile", userController.getProfile);
router.get("/profile/:id", userController.getProfileById);
router.put("/profile", userController.updateProfile);
router.post("/change-password", userController.changePassword);
router.get("/ratings", userController.getRatings);
router.get("/:id/ratings", userController.getRatingsByUserId);
router.get("/bidding-products", userController.getBiddingProducts);
router.get("/won-products", userController.getWonProducts);
router.post("/rate-seller", userController.rateSeller);
router.post("/request-seller-upgrade", userController.requestSellerUpgrade);

export default router;
