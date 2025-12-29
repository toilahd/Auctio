import adminService from '../services/adminService.js';
import { getLogger } from '../config/logger.js';

const logger = getLogger('AdminController');

// ==================== CATEGORY MANAGEMENT ====================

export const getAllCategories = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await adminService.getAllCategories({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get all categories error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await adminService.getCategoryById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    logger.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, parentId } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const category = await adminService.createCategory({ name, parentId });

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully'
    });
  } catch (error) {
    logger.error('Create category error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentId } = req.body;

    const category = await adminService.updateCategory(id, { name, parentId });

    res.json({
      success: true,
      data: category,
      message: 'Category updated successfully'
    });
  } catch (error) {
    logger.error('Update category error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await adminService.deleteCategory(id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    logger.error('Delete category error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
