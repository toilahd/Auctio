import express from 'express';
import * as adminController from '../controllers/adminController.js';
import * as auctionSettingsController from '../controllers/auctionSettingsController.js';
import * as auctionSchedulerController from '../controllers/auctionSchedulerController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/adminMiddleware.js';
import getUserFromJwt from '../utils/getUserFromJwtMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
// router.use(authenticateToken);
router.use(getUserFromJwt);
router.use(requireAdmin);

// ==================== CATEGORY MANAGEMENT ====================
router.get('/categories', adminController.getAllCategories);
router.get('/categories/:id', adminController.getCategoryById);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// ==================== PRODUCT MANAGEMENT ====================
router.get('/products', adminController.getAllProducts);
router.get('/products/:id', adminController.getProductById);
router.delete('/products/:id', adminController.removeProduct);

// ==================== USER MANAGEMENT ====================
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.delete('/users/:id', adminController.deleteUser);

// Upgrade requests
router.get('/upgrade-requests', adminController.getUpgradeRequests);
router.post('/upgrade-requests/:userId/approve', adminController.approveUpgradeRequest);
router.post('/upgrade-requests/:userId/reject', adminController.rejectUpgradeRequest);

// ==================== DASHBOARD ====================
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/user-growth', adminController.getUserGrowth);
router.get('/dashboard/product-growth', adminController.getProductGrowth);
router.get('/dashboard/top-sellers', adminController.getTopSellers);
router.get('/dashboard/top-products', adminController.getTopProducts);

// ==================== AUCTION SETTINGS ====================
router.get('/auction-settings', auctionSettingsController.getAuctionSettings);
router.put('/auction-settings', auctionSettingsController.updateAuctionSettings);

// ==================== AUCTION SCHEDULER ====================
router.post('/close-expired-auctions', auctionSchedulerController.closeExpiredAuctions);

export default router;

