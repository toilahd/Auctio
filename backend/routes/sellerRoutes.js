import express from 'express';
import sellerController from '../controllers/sellerController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All seller routes require authentication
router.use(authenticate);

// ==================== PRODUCT MANAGEMENT ====================

/**
 * POST /api/seller/products
 * Create a new auction product
 * Body:
 *  - title: string (required)
 *  - description: string (required, WYSIWYG content)
 *  - images: string[] (required, minimum 3 URLs)
 *  - startPrice: number (required)
 *  - stepPrice: number (required)
 *  - buyNowPrice: number (optional)
 *  - categoryId: string (required)
 *  - autoExtend: boolean (optional, default false)
 *  - endTime: ISO date string (required)
 */
router.post('/products', sellerController.createProduct);

/**
 * GET /api/seller/products/active
 * Get seller's active products
 * Query params: page, limit
 */
router.get('/products/active', sellerController.getActiveProducts);

/**
 * GET /api/seller/products/completed
 * Get seller's completed products with winners
 * Query params: page, limit
 */
router.get('/products/completed', sellerController.getCompletedProducts);

/**
 * PATCH /api/seller/products/:id/description
 * Append additional description to product
 * Body:
 *  - description: string (required)
 */
router.patch('/products/:id/description', sellerController.appendDescription);

/**
 * POST /api/seller/products/:id/deny-bidder
 * Deny a bidder from bidding on this product
 * Body:
 *  - bidderId: string (required)
 *  - reason: string (optional)
 */
router.post('/products/:id/deny-bidder', sellerController.denyBidder);

/**
 * POST /api/seller/products/:id/rate-winner
 * Rate the winner of an auction
 * Body:
 *  - rating: number (+1 or -1)
 *  - comment: string (optional)
 */
router.post('/products/:id/rate-winner', sellerController.rateWinner);

/**
 * POST /api/seller/products/:id/cancel-transaction
 * Cancel transaction and auto-rate winner negatively
 */
router.post('/products/:id/cancel-transaction', sellerController.cancelTransaction);

// ==================== QUESTIONS ====================

/**
 * POST /api/seller/questions/:id/answer
 * Answer a question about a product
 * Body:
 *  - content: string (required)
 */
router.post('/questions/:id/answer', sellerController.answerQuestion);

export default router;

