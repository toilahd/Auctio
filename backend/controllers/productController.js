// controllers/productController.js
import productService from "../services/productService.js";
import { getLogger } from "../config/logger.js";

const logger = getLogger("ProductController");

class ProductController {
  async searchProducts(req, res) {
    /*
     GET /api/products/search
     #swagger.tags = ['Products']
     #swagger.summary = 'Search products with filters'
     #swagger.description = 'Search products with filters (Vietnamese no-accent supported)'
     #swagger.parameters['q'] = { in: 'query', description: 'Search query', type: 'string' }
     #swagger.parameters['categoryId'] = { in: 'query', description: 'Filter by category ID', type: 'integer' }
     #swagger.parameters['page'] = { in: 'query', description: 'Page number', type: 'integer', default: 1 }
     #swagger.parameters['limit'] = { in: 'query', description: 'Items per page', type: 'integer', default: 20 }
     #swagger.parameters['sortBy'] = { in: 'query', description: 'Sort by field', type: 'string', enum: ['endTime', 'price', 'newest', 'bidCount'], default: 'endTime' }
     #swagger.parameters['order'] = { in: 'query', description: 'Sort order', type: 'string', enum: ['asc', 'desc'], default: 'desc' }
     #swagger.parameters['highlightMinutes'] = { in: 'query', description: 'Minutes to highlight new products', type: 'integer', default: 30 }
     */
    try {
      const {
        q,
        categoryId,
        page = 1,
        limit = 20,
        sortBy = "endTime",
        order = "desc",
        highlightMinutes = 30,
      } = req.query;

      const result = await productService.searchProducts({
        searchQuery: q,
        categoryId,
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        order,
        highlightMinutes: parseInt(highlightMinutes),
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error("Error in searchProducts:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to search products",
      });
    }
  }

  async getProductById(req, res) {
    /*
     GET /api/products/:id
     #swagger.tags = ['Products']
     #swagger.summary = 'Get product details by ID'
     #swagger.description = 'Get product details by ID'
     #swagger.parameters['id'] = { in: 'path', description: 'Product ID', required: true, type: 'integer' }
     */
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      logger.error("Error in getProductById:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get product",
      });
    }
  }

  async getTopProducts(req, res) {
    /*
     GET /api/products/top/:criteria
     #swagger.tags = ['Products']
     #swagger.summary = 'Get top 5 products for homepage'
     #swagger.description = 'Get top 5 products for homepage'
     #swagger.parameters['criteria'] = { in: 'path', description: 'Criteria for top products', required: true, type: 'string', enum: ['ending_soon', 'most_bids', 'highest_price'] }
     */
    try {
      const { criteria = "ending_soon" } = req.params;
      const products = await productService.getTopProducts(criteria);

      return res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      logger.error("Error in getTopProducts:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get top products",
      });
    }
  }

  async getProductsByCategory(req, res) {
    /*
     GET /api/products/category/:categoryId
     #swagger.tags = ['Products']
     #swagger.summary = 'Get products by category with pagination'
     #swagger.description = 'Get products by category with pagination'
     #swagger.parameters['categoryId'] = { in: 'path', description: 'Category ID', required: true, type: 'integer' }
     #swagger.parameters['page'] = { in: 'query', description: 'Page number', type: 'integer', default: 1 }
     #swagger.parameters['limit'] = { in: 'query', description: 'Items per page', type: 'integer', default: 20 }
     */
    try {
      const { categoryId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const result = await productService.getProductsByCategory(
        categoryId,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error("Error in getProductsByCategory:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get products",
      });
    }
  }
}

export default new ProductController();
