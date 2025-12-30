import sellerService from "../services/sellerService.js";
import questionService from "../services/questionService.js";
import { getLogger } from "../config/logger.js";

const logger = getLogger("SellerController");

class SellerController {
  // ==================== PRODUCT CREATION ====================

  /**
   * Create a new auction product
   * POST /api/seller/products
   */
  async createProduct(req, res) {
    /*
      #swagger.summary = 'Create new auction product'
      #swagger.description = 'Create a new auction product listing (seller only)'
      #swagger.security = [{ "bearerAuth": [] }, { "cookieAuth": [] }]
      #swagger.tags = ['Seller']
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Product details',
        required: true,
        schema: {
          title: 'Product Title',
          description: 'Product description',
          images: ['image1.jpg', 'image2.jpg'],
          startPrice: 100.00,
          stepPrice: 10.00,
          buyNowPrice: 500.00,
          categoryId: 'category-uuid',
          autoExtend: true,
          endTime: '2025-12-31T23:59:59Z'
        }
      }
      #swagger.responses[201] = {
        description: 'Product created successfully',
        schema: {
          success: true,
          data: { $ref: '#/definitions/Product' }
        }
      }
      #swagger.responses[400] = {
        description: 'Missing required fields',
        schema: { success: false, message: 'Missing required fields' }
      }
      #swagger.responses[401] = {
        description: 'Unauthorized',
        schema: { success: false, message: 'Unauthorized' }
      }
    */
    try {
      const sellerId = req.user?.id;

      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const {
        title,
        description,
        images,
        startPrice,
        stepPrice,
        buyNowPrice,
        categoryId,
        autoExtend,
        endTime,
      } = req.body;

      // Validation
      if (
        !title ||
        !description ||
        !images ||
        !startPrice ||
        !stepPrice ||
        !categoryId ||
        !endTime
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      const product = await sellerService.createProduct(sellerId, {
        title,
        description,
        images,
        startPrice: parseFloat(startPrice),
        stepPrice: parseFloat(stepPrice),
        buyNowPrice: buyNowPrice ? parseFloat(buyNowPrice) : null,
        categoryId,
        autoExtend,
        endTime,
      });

      return res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      logger.error("Error in createProduct:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to create product",
      });
    }
  }

  // ==================== PRODUCT DESCRIPTION UPDATE ====================

  /**
   * Append description to product
   * PATCH /api/seller/products/:id/description
   */
  async appendDescription(req, res) {
    /*
      #swagger.summary = 'Append product description'
      #swagger.description = 'Add additional text to existing product description (seller only)'
      #swagger.security = [{ "bearerAuth": [] }, { "cookieAuth": [] }]
      #swagger.tags = ['Seller']
      #swagger.parameters['id'] = {
        in: 'path',
        description: 'Product ID',
        required: true,
        type: 'string'
      }
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Description to append',
        required: true,
        schema: {
          description: 'Additional product information...'
        }
      }
      #swagger.responses[200] = {
        description: 'Description updated successfully',
        schema: {
          success: true,
          data: { $ref: '#/definitions/Product' }
        }
      }
      #swagger.responses[400] = {
        description: 'Description is required',
        schema: { success: false, message: 'Description is required' }
      }
      #swagger.responses[401] = {
        description: 'Unauthorized',
        schema: { success: false, message: 'Unauthorized' }
      }
    */
    try {
      const sellerId = req.user?.id;
      const { id } = req.params;
      const { description } = req.body;

      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (!description) {
        return res.status(400).json({
          success: false,
          message: "Description is required",
        });
      }

      const product = await sellerService.appendDescription(
        sellerId,
        id,
        description
      );

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      logger.error("Error in appendDescription:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update description",
      });
    }
  }

  // ==================== DENY BIDDER ====================

  /**
   * Deny a bidder from bidding on a product
   * POST /api/seller/products/:id/deny-bidder
   */
  async denyBidder(req, res) {
    /*
      #swagger.summary = 'Deny bidder from product'
      #swagger.description = 'Block a specific bidder from placing bids on a product (seller only)'
      #swagger.security = [{ "bearerAuth": [] }, { "cookieAuth": [] }]
      #swagger.tags = ['Seller']
      #swagger.parameters['id'] = {
        in: 'path',
        description: 'Product ID',
        required: true,
        type: 'string'
      }
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Bidder to deny',
        required: true,
        schema: {
          bidderId: 'bidder-user-id',
          reason: 'Reason for denying (optional)'
        }
      }
      #swagger.responses[200] = {
        description: 'Bidder denied successfully',
        schema: {
          success: true,
          message: 'Bidder denied successfully'
        }
      }
      #swagger.responses[400] = {
        description: 'Bidder ID is required',
        schema: { success: false, message: 'Bidder ID is required' }
      }
      #swagger.responses[401] = {
        description: 'Unauthorized',
        schema: { success: false, message: 'Unauthorized' }
      }
    */
    try {
      const sellerId = req.user?.id;
      const { id } = req.params;
      const { bidderId, reason } = req.body;

      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (!bidderId) {
        return res.status(400).json({
          success: false,
          message: "Bidder ID is required",
        });
      }

      const result = await sellerService.denyBidder(
        sellerId,
        id,
        bidderId,
        reason
      );

      return res.status(200).json(result);
    } catch (error) {
      logger.error("Error in denyBidder:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to deny bidder",
      });
    }
  }

  // ==================== ANSWER QUESTIONS ====================

  /**
   * Answer a question
   * POST /api/seller/questions/:id/answer
   */
  async answerQuestion(req, res) {
    /*
      #swagger.summary = 'Answer product question'
      #swagger.description = 'Answer a question asked by a bidder about a product (seller only)'
      #swagger.security = [{ "bearerAuth": [] }, { "cookieAuth": [] }]
      #swagger.tags = ['Seller']
      #swagger.parameters['id'] = {
        in: 'path',
        description: 'Question ID',
        required: true,
        type: 'string'
      }
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Answer content',
        required: true,
        schema: {
          content: 'This is the answer to your question...'
        }
      }
      #swagger.responses[201] = {
        description: 'Answer created successfully',
        schema: {
          success: true,
          data: { $ref: '#/definitions/Answer' }
        }
      }
      #swagger.responses[400] = {
        description: 'Answer content is required',
        schema: { success: false, message: 'Answer content is required' }
      }
      #swagger.responses[401] = {
        description: 'Unauthorized',
        schema: { success: false, message: 'Unauthorized' }
      }
    */
    try {
      const sellerId = req.user?.id;
      const { id } = req.params;
      const { content } = req.body;

      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (!content) {
        return res.status(400).json({
          success: false,
          message: "Answer content is required",
        });
      }

      const answer = await questionService.answerQuestion(
        id,
        sellerId,
        content
      );

      return res.status(201).json({
        success: true,
        data: answer,
      });
    } catch (error) {
      logger.error("Error in answerQuestion:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to answer question",
      });
    }
  }

  // ==================== PRODUCT MANAGEMENT ====================

  /**
   * Get seller's active products
   * GET /api/seller/products/active
   */
  async getActiveProducts(req, res) {
    /*
      #swagger.summary = 'Get seller active products'
      #swagger.description = 'Get list of seller\'s currently active auction products'
      #swagger.security = [{ "bearerAuth": [] }, { "cookieAuth": [] }]
      #swagger.tags = ['Seller']
      #swagger.parameters['page'] = {
        in: 'query',
        description: 'Page number',
        required: false,
        type: 'integer',
        default: 1
      }
      #swagger.parameters['limit'] = {
        in: 'query',
        description: 'Items per page',
        required: false,
        type: 'integer',
        default: 20
      }
      #swagger.responses[200] = {
        description: 'Active products retrieved successfully',
        schema: {
          success: true,
          data: {
            products: [{ $ref: '#/definitions/Product' }],
            total: 100,
            page: 1,
            totalPages: 5
          }
        }
      }
      #swagger.responses[401] = {
        description: 'Unauthorized',
        schema: { success: false, message: 'Unauthorized' }
      }
    */
    try {
      const sellerId = req.user?.id;
      const { page = 1, limit = 20 } = req.query;

      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await sellerService.getSellerActiveProducts(
        sellerId,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error("Error in getActiveProducts:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get active products",
      });
    }
  }

  /**
   * Get seller's completed products with winners
   * GET /api/seller/products/completed
   */
  async getCompletedProducts(req, res) {
    /*
      #swagger.summary = 'Get seller completed products'
      #swagger.description = 'Get list of seller\'s completed auction products with winner information'
      #swagger.security = [{ "bearerAuth": [] }, { "cookieAuth": [] }]
      #swagger.tags = ['Seller']
      #swagger.parameters['page'] = {
        in: 'query',
        description: 'Page number',
        required: false,
        type: 'integer',
        default: 1
      }
      #swagger.parameters['limit'] = {
        in: 'query',
        description: 'Items per page',
        required: false,
        type: 'integer',
        default: 20
      }
      #swagger.responses[200] = {
        description: 'Completed products retrieved successfully',
        schema: {
          success: true,
          data: {
            products: [{ $ref: '#/definitions/Product' }],
            total: 50,
            page: 1,
            totalPages: 3
          }
        }
      }
      #swagger.responses[401] = {
        description: 'Unauthorized',
        schema: { success: false, message: 'Unauthorized' }
      }
    */
    try {
      const sellerId = req.user?.id;
      const { page = 1, limit = 20 } = req.query;

      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await sellerService.getSellerCompletedProducts(
        sellerId,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error("Error in getCompletedProducts:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get completed products",
      });
    }
  }

  // ==================== RATING ====================

  /**
   * Rate a winner
   * POST /api/seller/products/:id/rate-winner
   */
  async rateWinner(req, res) {
    /*
      #swagger.summary = 'Rate auction winner'
      #swagger.description = 'Rate the winner of a completed auction (+1 or -1) (seller only)'
      #swagger.security = [{ "bearerAuth": [] }, { "cookieAuth": [] }]
      #swagger.tags = ['Seller']
      #swagger.parameters['id'] = {
        in: 'path',
        description: 'Product ID',
        required: true,
        type: 'string'
      }
      #swagger.parameters['body'] = {
        in: 'body',
        description: 'Rating details',
        required: true,
        schema: {
          rating: 1,
          comment: 'Great buyer, quick payment'
        }
      }
      #swagger.responses[200] = {
        description: 'Winner rated successfully',
        schema: {
          success: true,
          message: 'Winner rated successfully'
        }
      }
      #swagger.responses[400] = {
        description: 'Rating is required',
        schema: { success: false, message: 'Rating is required (+1 or -1)' }
      }
      #swagger.responses[401] = {
        description: 'Unauthorized',
        schema: { success: false, message: 'Unauthorized' }
      }
    */
    try {
      const sellerId = req.user?.id;
      const { id } = req.params;
      const { rating, comment } = req.body;

      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (rating === undefined) {
        return res.status(400).json({
          success: false,
          message: "Rating is required (+1 or -1)",
        });
      }

      const result = await sellerService.rateWinner(
        sellerId,
        id,
        rating,
        comment || ""
      );

      return res.status(200).json(result);
    } catch (error) {
      logger.error("Error in rateWinner:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to rate winner",
      });
    }
  }

  /**
   * Cancel transaction and auto-rate winner negatively
   * POST /api/seller/products/:id/cancel-transaction
   */
  async cancelTransaction(req, res) {
    /*
      #swagger.summary = 'Cancel transaction'
      #swagger.description = 'Cancel transaction with auction winner and automatically give negative rating (seller only)'
      #swagger.security = [{ "bearerAuth": [] }, { "cookieAuth": [] }]
      #swagger.tags = ['Seller']
      #swagger.parameters['id'] = {
        in: 'path',
        description: 'Product ID',
        required: true,
        type: 'string'
      }
      #swagger.responses[200] = {
        description: 'Transaction cancelled successfully',
        schema: {
          success: true,
          message: 'Transaction cancelled and winner rated negatively'
        }
      }
      #swagger.responses[401] = {
        description: 'Unauthorized',
        schema: { success: false, message: 'Unauthorized' }
      }
      #swagger.responses[500] = {
        description: 'Failed to cancel transaction',
        schema: { success: false, message: 'Failed to cancel transaction' }
      }
    */
    try {
      const sellerId = req.user?.id;
      const { id } = req.params;

      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await sellerService.cancelTransaction(sellerId, id);

      return res.status(200).json(result);
    } catch (error) {
      logger.error("Error in cancelTransaction:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to cancel transaction",
      });
    }
  }

  /**
   * Get seller configuration data
   * GET /api/seller/config
   */
  async getSellerConfig(req, res) {
    /*
      #swagger.summary = 'Get seller configuration'
      #swagger.description = 'Get configuration data for seller including categories and subcategories for product form'
      #swagger.security = [{ "bearerAuth": [] }, { "cookieAuth": [] }]
      #swagger.tags = ['Seller']
      #swagger.responses[200] = {
        description: 'Configuration retrieved successfully',
        schema: {
          success: true,
          data: {
            categories: [{
              id: 'category-uuid',
              name: 'Electronics',
              children: [{
                id: 'subcategory-uuid',
                name: 'Laptops'
              }]
            }]
          }
        }
      }
      #swagger.responses[401] = {
        description: 'Unauthorized',
        schema: { success: false, message: 'Unauthorized' }
      }
    */
    try {
      const sellerId = req.user?.id;

      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // Import CategoryModel dynamically to avoid circular dependency
      const { default: CategoryModel } = await import("../models/Category.js");

      // Get all root categories with their children
      const categories = await CategoryModel.getRootCategories();

      // Format data for frontend dropdown
      const formattedCategories = categories.map((parent) => ({
        id: parent.id,
        name: parent.name,
        children: (parent.children || []).map((child) => ({
          id: child.id,
          name: child.name,
        })),
      }));

      return res.status(200).json({
        success: true,
        data: {
          categories: formattedCategories,
        },
      });
    } catch (error) {
      logger.error("Error in getSellerConfig:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get seller configuration",
      });
    }
  }
}

export default new SellerController();
