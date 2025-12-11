import prisma from '../config/prisma.js';

export class CategoryModel {
  /**
   * Create a new category
   */
  static async create(categoryData) {
    return prisma.category.create({
      data: categoryData,
    });
  }

  /**
   * Get all categories
   */
  static async getAll() {
    return prisma.category.findMany({
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Get category by ID
   */
  static async findById(id) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  }

  /**
   * Get root categories (categories without parent)
   */
  static async getRootCategories() {
    return prisma.category.findMany({
      where: {
        parentId: null,
      },
      include: {
        children: {
          include: {
            _count: {
              select: {
                products: true,
              },
            },
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Get subcategories of a category
   */
  static async getSubcategories(parentId) {
    return prisma.category.findMany({
      where: { parentId },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Update category
   */
  static async update(id, updateData) {
    return prisma.category.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete category
   */
  static async delete(id) {
    return prisma.category.delete({
      where: { id },
    });
  }

  /**
   * Get category hierarchy (category with all parent path)
   */
  static async getCategoryHierarchy(id) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          include: {
            parent: {
              include: {
                parent: true,
              },
            },
          },
        },
      },
    });

    // Build hierarchy path
    const path = [];
    let current = category;
    while (current) {
      path.unshift(current);
      current = current.parent;
    }

    return path;
  }
}

export default CategoryModel;

