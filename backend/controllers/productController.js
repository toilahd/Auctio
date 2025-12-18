// controllers/productController.js
import productService from '../services/productService.js';
import { getLogger } from '../config/logger.js';

const logger = getLogger('ProductController');

class ProductController {
  /**
   * Search products with filters, pagination, and sorting
   * GET /api/products/search
   */
  async searchProducts(req, res) {
    try {
      const {
        q,
        categoryId,
        page = 1,
        limit = 20,
        sortBy = 'endTime',
        order = 'desc',
        highlightMinutes = 30
      } = req.query;

      const result = await productService.searchProducts({
        searchQuery: q,
        categoryId,
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        order,
        highlightMinutes: parseInt(highlightMinutes)
      });

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in searchProducts:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to search products'
      });
    }
  }

  /**
   * Get product by ID
   * GET /api/products/:id
   */
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      logger.error('Error in getProductById:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get product'
      });
    }
  }
}

export default new ProductController();

