// routes/questionRoutes.js
import express from "express";
import questionController from "../controllers/questionController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import getUserFromJwt from "../utils/getUserFromJwtMiddleware.js";
import { validate, questionSchemas } from "../middlewares/validationMiddleware.js";

const router = express.Router();

// Public route - get questions for a product
router.get("/product/:productId", validate(questionSchemas.getProductQuestions), questionController.getProductQuestions);

// Protected routes
// router.use(authenticate);
router.use(getUserFromJwt);

router.post("/", validate(questionSchemas.createQuestion), questionController.askQuestion);
router.post("/:questionId/answer", validate(questionSchemas.answerQuestion), questionController.answerQuestion);

export default router;
