// routes/questionRoutes.js
import express from 'express';
import questionController from '../controllers/questionController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route - get questions for a product
router.get('/product/:productId', questionController.getProductQuestions);

// Protected routes
router.post('/', authenticate, questionController.askQuestion);
router.post('/:questionId/answer', authenticate, questionController.answerQuestion);

export default router;

