// routes/productRoutes.js
import express from 'express';
import productController from '../controllers/productController.js';

const router = express.Router();

/**
 * GET /api/products/search
 * Search products with filters
 * Query params:
 *  - q: search query (Vietnamese no-accent supported)
 *  - categoryId: filter by category
 *  - page: page number (default 1)
 *  - limit: items per page (default 20)
 *  - sortBy: endTime|price|newest|bidCount (default endTime)
 *  - order: asc|desc (default desc)
 *  - highlightMinutes: minutes to highlight new products (default 30)
 */
router.get('/search', productController.searchProducts);

/**
 * GET /api/products/top/:criteria
 * Get top 5 products for homepage
 * Params: criteria = ending_soon|most_bids|highest_price
 */
router.get('/top/:criteria', productController.getTopProducts);

/**
 * GET /api/products/category/:categoryId
 * Get products by category with pagination
 * Query params: page, limit
 */
router.get('/category/:categoryId', productController.getProductsByCategory);

/**
 * GET /api/products/parent-category/:parentCategoryId
 * Get products by parent category (includes all subcategories)
 * Query params: page, limit
 */
router.get('/parent-category/:parentCategoryId', productController.getProductsByParentCategory);

/**
 * GET /api/products/:id
 * Get product by ID
 */
router.get('/:id', productController.getProductById);

export default router;
