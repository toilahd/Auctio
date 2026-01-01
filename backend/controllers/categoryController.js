// controllers/categoryController.js
import CategoryModel from "../models/Category.js";
import { getLogger } from "../config/logger.js";

const logger = getLogger("CategoryController");

class CategoryController {
  async getAll(req, res) {
    /*
     * GET /api/categories
     * #swagger.tags = ['Categories']
     * #swagger.summary = 'Get all categories'
     * #swagger.description = 'Get all categories with their product counts'
     */
    try {
      const categories = await CategoryModel.getAll();
      return res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      logger.error("Error getAll:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to load categories" });
    }
  }

  async getMenu(req, res) {
    /*
     * GET /api/categories/menu
     * #swagger.tags = ['Categories']
     * #swagger.summary = 'Get category menu hierarchy'
     * #swagger.description = 'Get all root categories with their children and product counts'
     */
    try {
      const roots = await CategoryModel.getRootCategories();
      const data = roots.map((parent) => ({
        id: parent.id,
        name: parent.name,
        children: (parent.children || []).map((c) => ({
          id: c.id,
          name: c.name,
          productCount: c._count?.products ?? 0,
        })),
        productCount: parent._count?.products ?? 0,
      }));
      return res.status(200).json({ success: true, data });
    } catch (error) {
      logger.error("Error getMenu:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to load categories" });
    }
  }
}

export default new CategoryController();
