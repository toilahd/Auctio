// controllers/categoryController.js
import CategoryModel from '../models/Category.js';
import { getLogger } from '../config/logger.js';

const logger = getLogger('CategoryController');

class CategoryController {
  // GET /api/categories/menu
  async getMenu(req, res) {
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
      logger.error('Error getMenu:', error);
      return res.status(500).json({ success: false, message: 'Failed to load categories' });
    }
  }
}

export default new CategoryController();

