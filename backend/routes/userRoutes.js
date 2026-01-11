// routes/userRoutes.js
import express from "express";
import userController from "../controllers/userController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import getUserFromJwt from "../utils/getUserFromJwtMiddleware.js";
import { validate, userSchemas } from "../middlewares/validationMiddleware.js";

const router = express.Router();

// All routes require authentication
// router.use(authenticate);
router.use(getUserFromJwt);

router.get("/profile", userController.getProfile);
router.get("/profile/:id", validate(userSchemas.getProfileById), userController.getProfileById);
router.put("/profile", validate(userSchemas.updateProfile), userController.updateProfile);
router.post("/change-password", validate(userSchemas.changePassword), userController.changePassword);
router.get("/ratings", userController.getRatings);
router.get("/:id/ratings", validate(userSchemas.getRatingsByUserId), userController.getRatingsByUserId);
router.get("/bidding-products", userController.getBiddingProducts);
router.get("/won-products", userController.getWonProducts);
router.post("/rate-seller", validate(userSchemas.rateSeller), userController.rateSeller);
router.post("/request-seller-upgrade", userController.requestSellerUpgrade);

export default router;
