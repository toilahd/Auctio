// routes/orderRoutes.js
import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import getUserFromJwt from '../utils/getUserFromJwtMiddleware.js';
import orderController from '../controllers/orderController.js';
import { validate, orderSchemas } from '../middlewares/validationMiddleware.js';

const router = express.Router();

/**
 * PUT /api/products/:id/ship
 * Seller confirms shipment (PAYED → SHIPPING)
 */
router.put('/:id/ship', getUserFromJwt, validate(orderSchemas.updateOrderStatus), orderController.confirmShipment);

/**
 * PUT /api/products/:id/deliver
 * Buyer confirms delivery (SHIPPING → DELIVERED)
 */
router.put('/:id/deliver', getUserFromJwt, validate(orderSchemas.updateOrderStatus), orderController.confirmDelivery);

/**
 * PUT /api/products/:id/cancel
 * Seller cancels order (any status → CANCELLED, auto -1 rating)
 */
router.put('/:id/cancel', getUserFromJwt, validate(orderSchemas.updateOrderStatus), orderController.cancelOrder);

/**
 * PUT /api/products/:id/reject-winner
 * Seller rejects current winner and moves to next bidder (auto -1 rating)
 */
router.put('/:id/reject-winner', getUserFromJwt, validate(orderSchemas.updateOrderStatus), orderController.rejectWinner);

/**
 * GET /api/products/:id/bidders
 * Get list of bidders ordered by bid amount (highest first)
 */
router.get('/:id/bidders', getUserFromJwt, validate(orderSchemas.updateOrderStatus), orderController.getBidders);

/**
 * POST /api/products/:id/rate
 * Submit or edit rating after delivery
 */
router.post('/:id/rate', getUserFromJwt, validate(orderSchemas.rateOrder), orderController.submitRating);

/**
 * GET /api/products/:id/ratings
 * Get ratings for a product (order)
 */
router.get('/:id/ratings', getUserFromJwt, validate(orderSchemas.updateOrderStatus), orderController.getRatings);

/**
 * POST /api/products/:id/chat
 * Send chat message
 */
router.post('/:id/chat', getUserFromJwt, validate(orderSchemas.sendMessage), orderController.sendMessage);

/**
 * GET /api/products/:id/chat
 * Get chat messages
 */
router.get('/:id/chat', getUserFromJwt, validate(orderSchemas.updateOrderStatus), orderController.getMessages);

export default router;
