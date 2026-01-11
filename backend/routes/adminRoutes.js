import express from 'express';
import * as adminController from '../controllers/adminController.js';
import * as auctionSettingsController from '../controllers/auctionSettingsController.js';
import * as auctionSchedulerController from '../controllers/auctionSchedulerController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/adminMiddleware.js';
import getUserFromJwt from '../utils/getUserFromJwtMiddleware.js';
import { validate, adminSchemas, commonSchemas } from '../middlewares/validationMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
// router.use(authenticateToken);
router.use(getUserFromJwt);
router.use(requireAdmin);

// ==================== CATEGORY MANAGEMENT ====================
router.get('/categories', adminController.getAllCategories);
router.get('/categories/:id', validate(adminSchemas.deleteCategory), adminController.getCategoryById);
router.post('/categories', validate(adminSchemas.createCategory), adminController.createCategory);
router.put('/categories/:id', validate(adminSchemas.updateCategory), adminController.updateCategory);
router.delete('/categories/:id', validate(adminSchemas.deleteCategory), adminController.deleteCategory);

// ==================== PRODUCT MANAGEMENT ====================
router.get('/products', validate({ query: commonSchemas.pagination }), adminController.getAllProducts);
router.get('/products/:id', validate(adminSchemas.getProductById), adminController.getProductById);
router.delete('/products/:id', validate(adminSchemas.removeProduct), adminController.removeProduct);

// ==================== USER MANAGEMENT ====================
router.get('/users', validate({ query: commonSchemas.pagination }), adminController.getAllUsers);
router.get('/users/:id', validate(adminSchemas.getUserById), adminController.getUserById);
router.delete('/users/:id', validate(adminSchemas.deleteUser), adminController.deleteUser);

// Upgrade requests
router.get('/upgrade-requests', adminController.getUpgradeRequests);
router.post('/upgrade-requests/:userId/approve', validate(adminSchemas.approveUpgradeRequest), adminController.approveUpgradeRequest);
router.post('/upgrade-requests/:userId/reject', validate(adminSchemas.rejectUpgradeRequest), adminController.rejectUpgradeRequest);

// ==================== DASHBOARD ====================
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/user-growth', adminController.getUserGrowth);
router.get('/dashboard/product-growth', adminController.getProductGrowth);
router.get('/dashboard/top-sellers', adminController.getTopSellers);
router.get('/dashboard/top-products', adminController.getTopProducts);

// ==================== AUCTION SETTINGS ====================
router.get('/auction-settings', auctionSettingsController.getAuctionSettings);
router.put('/auction-settings', validate(adminSchemas.updateAuctionSettings), auctionSettingsController.updateAuctionSettings);

// ==================== AUCTION SCHEDULER ====================
router.post('/close-expired-auctions', auctionSchedulerController.closeExpiredAuctions);

export default router;

