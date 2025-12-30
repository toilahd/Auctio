import adminService from "../services/adminService.js";
import { getLogger } from "../config/logger.js";

const logger = getLogger("AdminController");

// ==================== CATEGORY MANAGEMENT ====================

export const getAllCategories = async (req, res) => {
  /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Get all categories'
    #swagger.description = 'Get all categories with pagination'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['page'] = {
      in: 'query',
      description: 'Page number',
      type: 'integer',
      default: 1
    }
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Items per page',
      type: 'integer',
      default: 20
    }
    #swagger.responses[200] = {
      description: 'Categories retrieved successfully'
    }
    #swagger.responses[401] = {
      description: 'Unauthorized'
    }
    #swagger.responses[403] = {
      description: 'Forbidden'
    }
    #swagger.responses[500] = {
      description: 'Internal Server Error'
    }
  */
  try {
    const { page, limit } = req.query;
    const result = await adminService.getAllCategories({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Get all categories error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCategoryById = async (req, res) => {
  /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Get category by ID'
    #swagger.description = 'Get detailed information about a specific category'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Category ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'Category retrieved successfully'
    }
    #swagger.responses[401] = {
      description: 'Unauthorized'
    }
    #swagger.responses[403] = {
      description: 'Forbidden'
    }
    #swagger.responses[404] = {
      description: 'Not Found'
    }
    #swagger.responses[500] = {
      description: 'Internal Server Error'
    }
  */
  try {
    const { id } = req.params;
    const category = await adminService.getCategoryById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    logger.error("Get category error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createCategory = async (req, res) => {
  /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Create new category'
    #swagger.description = 'Create a new category with optional parent category'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Category data',
      required: true,
      schema: {
        name: 'Category Name',
        parentId: 'parent-category-id'
      }
    }
    #swagger.responses[201] = {
      description: 'Created'
    }
    #swagger.responses[400] = {
      description: 'Bad Request'
    }
    #swagger.responses[401] = {
      description: 'Unauthorized'
    }
    #swagger.responses[403] = {
      description: 'Forbidden'
    }
  */
  try {
    const { name, parentId } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const category = await adminService.createCategory({ name, parentId });

    res.status(201).json({
      success: true,
      data: category,
      message: "Category created successfully",
    });
  } catch (error) {
    logger.error("Create category error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCategory = async (req, res) => {
  /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Update category'
    #swagger.description = 'Update category name or parent category'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Category ID',
      required: true,
      type: 'string'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Updated category data',
      required: true,
      schema: {
        name: 'Updated Category Name',
        parentId: 'parent-category-id'
      }
    }
    #swagger.responses[200] = {
      description: 'OK'
    }
    #swagger.responses[400] = {
      description: 'Bad Request'
    }
    #swagger.responses[401] = {
      description: 'Unauthorized'
    }
    #swagger.responses[403] = {
      description: 'Forbidden'
    }
  */
  try {
    const { id } = req.params;
    const { name, parentId } = req.body;

    const category = await adminService.updateCategory(id, { name, parentId });

    res.json({
      success: true,
      data: category,
      message: "Category updated successfully",
    });
  } catch (error) {
    logger.error("Update category error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCategory = async (req, res) => {
  /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Delete category'
    #swagger.description = 'Delete a category by ID'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Category ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'OK'
    }
    #swagger.responses[400] = {
      description: 'Bad Request'
    }
    #swagger.responses[401] = {
      description: 'Unauthorized'
    }
    #swagger.responses[403] = {
      description: 'Forbidden'
    }
  */
  try {
    const { id } = req.params;
    await adminService.deleteCategory(id);

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    logger.error("Delete category error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== PRODUCT MANAGEMENT ====================

export const getAllProducts = async (req, res) => {
  /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Get all products'
    #swagger.description = 'Get all products with pagination and filters'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['page'] = {
      in: 'query',
      description: 'Page number',
      type: 'integer',
      default: 1
    }
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Items per page',
      type: 'integer',
      default: 20
    }
    #swagger.parameters['status'] = {
      in: 'query',
      description: 'Filter by status',
      type: 'string'
    }
    #swagger.parameters['sellerId'] = {
      in: 'query',
      description: 'Filter by seller ID',
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'OK'
    }
    #swagger.responses[401] = {
      description: 'Unauthorized'
    }
    #swagger.responses[403] = {
      description: 'Forbidden'
    }
    #swagger.responses[500] = {
      description: 'Internal Server Error'
    }
  */
  try {
    const { page, limit, status, sellerId } = req.query;
    const result = await adminService.getAllProducts({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      status,
      sellerId,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Get all products error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Get product by ID'
    #swagger.description = 'Get detailed information about a specific product'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Product ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'OK'
    }
    #swagger.responses[401] = {
      description: 'Unauthorized'
    }
    #swagger.responses[403] = {
      description: 'Forbidden'
    }
    #swagger.responses[404] = {
      description: 'Not Found'
    }
    #swagger.responses[500] = {
      description: 'Internal Server Error'
    }
  */
  try {
    const { id } = req.params;
    const product = await adminService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    logger.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeProduct = async (req, res) => {
  /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Remove product'
    #swagger.description = 'Remove a product with reason'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Product ID',
      required: true,
      type: 'string'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Removal reason',
      required: false,
      schema: {
        reason: 'Reason for removal'
      }
    }
    #swagger.responses[200] = {
      description: 'OK'
    }
    #swagger.responses[400] = {
      description: 'Bad Request'
    }
    #swagger.responses[401] = {
      description: 'Unauthorized'
    }
    #swagger.responses[403] = {
      description: 'Forbidden'
    }
  */
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const product = await adminService.removeProduct(id, reason);

    res.json({
      success: true,
      data: product,
      message: "Product removed successfully",
    });
  } catch (error) {
    logger.error("Remove product error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// ==================== USER MANAGEMENT ====================

export const getAllUsers = async (req, res) => {
  /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Get all users'
    #swagger.description = 'Get all users with pagination and role filter'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['page'] = {
      in: 'query',
      description: 'Page number',
      type: 'integer',
      default: 1
    }
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Items per page',
      type: 'integer',
      default: 20
    }
    #swagger.parameters['role'] = {
      in: 'query',
      description: 'Filter by role',
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'OK'
    }
    #swagger.responses[401] = {
      description: 'Unauthorized'
    }
    #swagger.responses[403] = {
      description: 'Forbidden'
    }
    #swagger.responses[500] = {
      description: 'Internal Server Error'
    }
  */
  try {
    const { page, limit, role } = req.query;
    const result = await adminService.getAllUsers({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      role,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Get user by ID'
    #swagger.description = 'Get detailed information about a specific user'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'User ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'OK'
    }
    #swagger.responses[401] = {
      description: 'Unauthorized'
    }
    #swagger.responses[403] = {
      description: 'Forbidden'
    }
    #swagger.responses[404] = {
      description: 'Not Found'
    }
    #swagger.responses[500] = {
      description: 'Internal Server Error'
    }
  */
  try {
    const { id } = req.params;
    const user = await adminService.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUpgradeRequests = async (req, res) => {
  /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Get upgrade requests'
    #swagger.description = 'Get all seller upgrade requests with pagination and status filter'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['page'] = {
      in: 'query',
      description: 'Page number',
      type: 'integer',
      default: 1
    }
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Items per page',
      type: 'integer',
      default: 20
    }
    #swagger.parameters['status'] = {
      in: 'query',
      description: 'Filter by status',
      type: 'string',
      default: 'PENDING'
    }
    #swagger.responses[200] = {
      description: 'OK'
    }
    #swagger.responses[401] = {
      description: 'Unauthorized'
    }
    #swagger.responses[403] = {
      description: 'Forbidden'
    }
    #swagger.responses[500] = {
      description: 'Internal Server Error'
    }
  */
  try {
    const { page, limit, status } = req.query;
    const result = await adminService.getUpgradeRequests({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      status: status || "PENDING",
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Get upgrade requests error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const approveUpgradeRequest = async (req, res) => {
  /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Approve upgrade request'
    #swagger.description = 'Approve a seller upgrade request'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['userId'] = {
      in: 'path',
      description: 'User ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'OK'
    }
    #swagger.responses[400] = {
      description: 'Bad Request'
    }
    #swagger.responses[401] = {
      description: 'Unauthorized'
    }
    #swagger.responses[403] = {
      description: 'Forbidden'
    }
  */
  try {
    const { userId } = req.params;
    const user = await adminService.approveUpgradeRequest(userId);

    res.json({
      success: true,
      data: user,
      message: "Upgrade request approved successfully",
    });
  } catch (error) {
    logger.error("Approve upgrade request error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const rejectUpgradeRequest = async (req, res) => {
  /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Reject upgrade request'
    #swagger.description = 'Reject a seller upgrade request with reason'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['userId'] = {
      in: 'path',
      description: 'User ID',
      required: true,
      type: 'string'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Rejection reason',
      required: false,
      schema: {
        reason: 'Reason for rejection'
      }
    }
    #swagger.responses[200] = {
      description: 'OK'
    }
    #swagger.responses[400] = {
      description: 'Bad Request'
    }
    #swagger.responses[401] = {
      description: 'Unauthorized'
    }
    #swagger.responses[403] = {
      description: 'Forbidden'
    }
  */
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const user = await adminService.rejectUpgradeRequest(userId, reason);

    res.json({
      success: true,
      data: user,
      message: "Upgrade request rejected",
    });
  } catch (error) {
    logger.error("Reject upgrade request error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Delete user'
    #swagger.description = 'Delete a user account'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'User ID',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = {
      description: 'OK'
    }
    #swagger.responses[400] = {
      description: 'Bad Request'
    }
    #swagger.responses[401] = {
      description: 'Unauthorized'
    }
    #swagger.responses[403] = {
      description: 'Forbidden'
    }
  */
  try {
    const { id } = req.params;
    await adminService.deleteUser(id);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    logger.error("Delete user error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== DASHBOARD ====================

export const getDashboardStats = async (req, res) => {
  /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Get dashboard statistics'
    #swagger.description = 'Get overall dashboard statistics for admin panel'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.responses[200] = {
      description: 'OK'
    }
    #swagger.responses[401] = {
      description: 'Unauthorized'
    }
    #swagger.responses[403] = {
      description: 'Forbidden'
    }
    #swagger.responses[500] = {
      description: 'Internal Server Error'
    }
  */
  try {
    const stats = await adminService.getDashboardStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserGrowth = async (req, res) => {
  /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Get user growth data'
    #swagger.description = 'Get user registration growth over specified time period'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['days'] = {
      in: 'query',
      description: 'Number of days to analyze',
      type: 'integer',
      default: 30
    }
    #swagger.responses[200] = {
      description: 'OK'
    }
    #swagger.responses[401] = {
      description: 'Unauthorized'
    }
    #swagger.responses[403] = {
      description: 'Forbidden'
    }
    #swagger.responses[500] = {
      description: 'Internal Server Error'
    }
  */
  try {
    const { days } = req.query;
    const data = await adminService.getUserGrowth({
      days: parseInt(days) || 30,
    });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error("Get user growth error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProductGrowth = async (req, res) => {
  /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Get product growth data'
    #swagger.description = 'Get product creation growth over specified time period'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['days'] = {
      in: 'query',
      description: 'Number of days to analyze',
      type: 'integer',
      default: 30
    }
    #swagger.responses[200] = {
      description: 'OK'
    }
    #swagger.responses[401] = {
      description: 'Unauthorized'
    }
    #swagger.responses[403] = {
      description: 'Forbidden'
    }
    #swagger.responses[500] = {
      description: 'Internal Server Error'
    }
  */
  try {
    const { days } = req.query;
    const data = await adminService.getProductGrowth({
      days: parseInt(days) || 30,
    });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error("Get product growth error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTopSellers = async (req, res) => {
  /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Get top sellers'
    #swagger.description = 'Get top sellers ranked by revenue'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Number of sellers to return',
      type: 'integer',
      default: 10
    }
    #swagger.responses[200] = {
      description: 'OK'
    }
    #swagger.responses[401] = {
      description: 'Unauthorized'
    }
    #swagger.responses[403] = {
      description: 'Forbidden'
    }
    #swagger.responses[500] = {
      description: 'Internal Server Error'
    }
  */
  try {
    const { limit } = req.query;
    const data = await adminService.getTopSellersByRevenue({
      limit: parseInt(limit) || 10,
    });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error("Get top sellers error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTopProducts = async (req, res) => {
  /*
    #swagger.tags = ['Admin']
    #swagger.summary = 'Get top products'
    #swagger.description = 'Get top products ranked by bids or price'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Number of products to return',
      type: 'integer',
      default: 10
    }
    #swagger.parameters['sortBy'] = {
      in: 'query',
      description: 'Sort criteria',
      type: 'string',
      default: 'bids',
      enum: ['bids', 'price']
    }
    #swagger.responses[200] = {
      description: 'OK'
    }
    #swagger.responses[401] = {
      description: 'Unauthorized'
    }
    #swagger.responses[403] = {
      description: 'Forbidden'
    }
    #swagger.responses[500] = {
      description: 'Internal Server Error'
    }
  */
  try {
    const { limit, sortBy } = req.query;
    const data = await adminService.getTopProducts({
      limit: parseInt(limit) || 10,
      sortBy: sortBy || "bids",
    });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error("Get top products error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
