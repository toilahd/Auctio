// routes/biddingRoutes.js
// Routes for bidding endpoints

import express from 'express';
import biddingController from '../controllers/biddingController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { validate, biddingSchemas } from '../middlewares/validationMiddleware.js';

const router = express.Router();

// All routes require authentication
// router.use(authenticateToken);

/**
 * @route   POST /api/bids
 * @desc    Place a bid on a product
 * @access  Private (Bidder)
 */
router.post('/', authenticateToken, validate(biddingSchemas.placeBid), biddingController.placeBid.bind(biddingController));

/**
 * @route   GET /api/bids/product/:productId
 * @desc    Get bid history for a product
 * @access  Private
 */
router.get('/product/:productId', validate(biddingSchemas.getBidHistory), biddingController.getBidHistory.bind(biddingController));

/**
 * @route   GET /api/bids/product/:productId/winner
 * @desc    Get current winning bid for a product
 * @access  Private
 */
router.get('/product/:productId/winner', validate(biddingSchemas.getCurrentWinner), biddingController.getCurrentWinner.bind(biddingController));

/**
 * @route   GET /api/bids/product/:productId/can-bid
 * @desc    Check if user can bid on product
 * @access  Private
 */
router.get('/product/:productId/can-bid', authenticateToken, validate(biddingSchemas.canUserBid), biddingController.canUserBid.bind(biddingController));

export default router;

