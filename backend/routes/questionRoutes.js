// routes/questionRoutes.js
import express from "express";
import questionController from "../controllers/questionController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import getUserFromJwt from "../utils/getUserFromJwtMiddleware.js";

const router = express.Router();

// Public route - get questions for a product
router.get("/product/:productId", questionController.getProductQuestions);

// Protected routes
// router.use(authenticate);
router.use(getUserFromJwt);

router.post("/", questionController.askQuestion);
router.post("/:questionId/answer", questionController.answerQuestion);

export default router;
