import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
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



export default router;

