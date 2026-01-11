// middlewares/validationMiddleware.js
// Centralized validation middleware using Zod

import * as z from 'zod';
import logger from '../config/logger.js';

/**
 * Middleware factory to validate request data using Zod schemas
 * @param {object} schemas - Object containing schemas for body, query, and params
 * @param {z.ZodSchema} schemas.body - Schema for request body
 * @param {z.ZodSchema} schemas.query - Schema for query parameters
 * @param {z.ZodSchema} schemas.params - Schema for route parameters
 */
export const validate = (schemas) => {
  return (req, res, next) => {
    const errors = {};

    // Validate body
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        errors.body = result.error.issues;
      }
    }

    // Validate query
    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        errors.query = result.error.issues;
      }
    }

    // Validate params
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        errors.params = result.error.issues;
      }
    }

    // If there are errors, return 400
    if (Object.keys(errors).length > 0) {
      logger.warn('Validation failed', { errors, path: req.path });
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

// ==================== COMMON SCHEMAS ====================

export const commonSchemas = {
  id: z.string().min(1, 'ID is required'),
  uuid: z.string().uuid('Invalid UUID format'),
  email: z.string().email('Invalid email format'),
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20)
  }).optional(),
  productId: z.object({
    productId: z.string().min(1, 'Product ID is required')
  }),
  userId: z.object({
    userId: z.string().min(1, 'User ID is required')
  })
};

// ==================== AUTH SCHEMAS ====================

export const authSchemas = {
  login: {
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(3, 'Password must be at least 3 characters').max(20, 'Password must be at most 20 characters')
    })
  },

  signup: {
    body: z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(3, 'Password must be at least 3 characters').max(20, 'Password must be at most 20 characters'),
      fullName: z.string().min(1, 'Full name is required').max(100, 'Full name must be at most 100 characters'),
      address: z.string().max(200, 'Address must be at most 200 characters').optional().default(''),
      captcha: z.string().min(1, 'Captcha is required')
    })
  },

  verifyEmail: {
    body: z.object({
      otp: z.string().length(6, 'OTP must be 6 characters')
    })
  },

  forgotPassword: {
    body: z.object({
      email: z.string().email('Invalid email format')
    })
  },

  resetPassword: {
    body: z.object({
      token: z.string().min(1, 'Token is required'),
      password: z.string().min(3, 'Password must be at least 3 characters').max(20, 'Password must be at most 20 characters')
    })
  }
};

// ==================== BIDDING SCHEMAS ====================

export const biddingSchemas = {
  placeBid: {
    body: z.object({
      productId: z.string().min(1, 'Product ID is required'),
      amount: z.number().positive('Amount must be positive')
    })
  },

  getBidHistory: {
    params: z.object({
      productId: z.string().min(1, 'Product ID is required')
    }),
    query: z.object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(20)
    }).optional()
  },

  getCurrentWinner: {
    params: z.object({
      productId: z.string().min(1, 'Product ID is required')
    })
  },

  canUserBid: {
    params: z.object({
      productId: z.string().min(1, 'Product ID is required')
    })
  }
};

// ==================== PRODUCT SCHEMAS ====================

export const productSchemas = {
  search: {
    query: z.object({
      q: z.string().optional(),
      categoryId: z.string().optional(),
      minPrice: z.coerce.number().nonnegative().optional(),
      maxPrice: z.coerce.number().nonnegative().optional(),
      hasBuyNow: z.enum(['true', 'false']).optional(),
      endingSoon: z.coerce.number().int().positive().optional(),
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(20),
      sortBy: z.enum(['endTime', 'price', 'newest', 'bidCount']).default('endTime'),
      order: z.enum(['asc', 'desc']).default('desc'),
      highlightMinutes: z.coerce.number().int().positive().default(30)
    }).optional()
  },

  getById: {
    params: z.object({
      id: z.string().min(1, 'Product ID is required')
    })
  },

  getByCategory: {
    params: z.object({
      categoryId: z.string().min(1, 'Category ID is required')
    }),
    query: z.object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().positive().max(100).default(20)
    }).optional()
  },

  getTopProducts: {
    params: z.object({
      criteria: z.enum(['ending_soon', 'most_bids', 'highest_price'], {
        errorMap: () => ({ message: 'Criteria must be one of: ending_soon, most_bids, highest_price' })
      })
    })
  }
};

// ==================== SELLER SCHEMAS ====================

export const sellerSchemas = {
  createProduct: {
    body: z.object({
      title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
      description: z.string().min(1, 'Description is required'),
      images: z.array(z.string().url('Invalid image URL')).min(3, 'At least 3 images are required'),
      startPrice: z.number().positive('Start price must be positive'),
      stepPrice: z.number().positive('Step price must be positive'),
      buyNowPrice: z.number().positive('Buy now price must be positive').optional(),
      categoryId: z.string().min(1, 'Category ID is required'),
      autoExtend: z.boolean().default(false),
      endTime: z.string().datetime('Invalid date format')
    })
  },

  appendDescription: {
    params: z.object({
      id: z.string().min(1, 'Product ID is required')
    }),
    body: z.object({
      description: z.string().min(1, 'Description is required')
    })
  },

  denyBidder: {
    params: z.object({
      id: z.string().min(1, 'Product ID is required')
    }),
    body: z.object({
      bidderId: z.string().min(1, 'Bidder ID is required'),
      reason: z.string().optional()
    })
  },

  rateWinner: {
    params: z.object({
      id: z.string().min(1, 'Product ID is required')
    }),
    body: z.object({
      rating: z.enum([1, -1]).or(z.literal(1)).or(z.literal(-1)),
      comment: z.string().optional()
    })
  },

  cancelTransaction: {
    params: z.object({
      id: z.string().min(1, 'Product ID is required')
    })
  },

  answerQuestion: {
    params: z.object({
      id: z.string().min(1, 'Question ID is required')
    }),
    body: z.object({
      content: z.string().min(1, 'Answer content is required')
    })
  }
};

// ==================== USER SCHEMAS ====================

export const userSchemas = {
  updateProfile: {
    body: z.object({
      fullName: z.string().min(1, 'Full name is required').max(100).optional(),
      address: z.string().max(200).optional(),
      phone: z.string().max(20).optional()
    })
  },

  changePassword: {
    body: z.object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z.string().min(3, 'Password must be at least 3 characters').max(20, 'Password must be at most 20 characters')
    })
  },

  rateSeller: {
    body: z.object({
      sellerId: z.string().min(1, 'Seller ID is required'),
      productId: z.string().min(1, 'Product ID is required'),
      rating: z.enum([1, -1]).or(z.literal(1)).or(z.literal(-1)),
      comment: z.string().optional()
    })
  },

  getRatingsByUserId: {
    params: z.object({
      id: z.string().min(1, 'User ID is required')
    })
  },

  getProfileById: {
    params: z.object({
      id: z.string().min(1, 'User ID is required')
    })
  }
};

// ==================== ADMIN SCHEMAS ====================

export const adminSchemas = {
  createCategory: {
    body: z.object({
      id: z.string().min(1, 'Category ID is required'),
      name: z.string().min(1, 'Category name is required'),
      parentId: z.string().optional()
    })
  },

  updateCategory: {
    params: z.object({
      id: z.string().min(1, 'Category ID is required')
    }),
    body: z.object({
      name: z.string().min(1, 'Category name is required').optional(),
      parentId: z.string().optional()
    })
  },

  deleteCategory: {
    params: z.object({
      id: z.string().min(1, 'Category ID is required')
    })
  },

  getProductById: {
    params: z.object({
      id: z.string().min(1, 'Product ID is required')
    })
  },

  removeProduct: {
    params: z.object({
      id: z.string().min(1, 'Product ID is required')
    })
  },

  getUserById: {
    params: z.object({
      id: z.string().min(1, 'User ID is required')
    })
  },

  deleteUser: {
    params: z.object({
      id: z.string().min(1, 'User ID is required')
    })
  },

  approveUpgradeRequest: {
    params: z.object({
      userId: z.string().min(1, 'User ID is required')
    })
  },

  rejectUpgradeRequest: {
    params: z.object({
      userId: z.string().min(1, 'User ID is required')
    })
  },

  updateAuctionSettings: {
    body: z.object({
      autoExtendEnabled: z.boolean().optional(),
      autoExtendTriggerMinutes: z.number().int().positive().optional(),
      autoExtendDurationMinutes: z.number().int().positive().optional()
    })
  }
};

// ==================== WATCHLIST SCHEMAS ====================

export const watchlistSchemas = {
  addToWatchlist: {
    body: z.object({
      productId: z.string().min(1, 'Product ID is required')
    })
  },

  removeFromWatchlist: {
    params: z.object({
      productId: z.string().min(1, 'Product ID is required')
    })
  },

  checkWatchlist: {
    params: z.object({
      productId: z.string().min(1, 'Product ID is required')
    })
  }
};

// ==================== QUESTION SCHEMAS ====================

export const questionSchemas = {
  getProductQuestions: {
    params: z.object({
      productId: z.string().min(1, 'Product ID is required')
    })
  },

  createQuestion: {
    body: z.object({
      productId: z.string().min(1, 'Product ID is required'),
      content: z.string().min(1, 'Question content is required').max(500, 'Question must be at most 500 characters')
    })
  },

  answerQuestion: {
    params: z.object({
      questionId: z.string().min(1, 'Question ID is required')
    }),
    body: z.object({
      content: z.string().min(1, 'Answer content is required').max(1000, 'Answer must be at most 1000 characters')
    })
  }
};

// ==================== ORDER SCHEMAS ====================

export const orderSchemas = {
  updateOrderStatus: {
    params: z.object({
      id: z.string().min(1, 'Order ID is required')
    })
  },

  rateOrder: {
    params: z.object({
      id: z.string().min(1, 'Order ID is required')
    }),
    body: z.object({
      rating: z.enum([1, -1]).or(z.literal(1)).or(z.literal(-1)),
      comment: z.string().optional()
    })
  },

  sendMessage: {
    params: z.object({
      id: z.string().min(1, 'Order ID is required')
    }),
    body: z.object({
      message: z.string().min(1, 'Message is required').max(1000, 'Message must be at most 1000 characters')
    })
  }
};

// ==================== CHAT SCHEMAS ====================

export const chatSchemas = {
  getMessages: {
    params: z.object({
      orderId: z.string().min(1, 'Order ID is required')
    })
  },

  sendMessage: {
    params: z.object({
      orderId: z.string().min(1, 'Order ID is required')
    }),
    body: z.object({
      message: z.string().min(1, 'Message is required').max(1000, 'Message must be at most 1000 characters')
    })
  },

  markAsRead: {
    params: z.object({
      orderId: z.string().min(1, 'Order ID is required')
    })
  }
};

// ==================== UPLOAD SCHEMAS ====================

export const uploadSchemas = {
  uploadImages: {
    body: z.object({
      images: z.array(z.any()).min(1, 'At least one image is required')
    })
  }
};

export default {
  validate,
  commonSchemas,
  authSchemas,
  biddingSchemas,
  productSchemas,
  sellerSchemas,
  userSchemas,
  adminSchemas,
  watchlistSchemas,
  questionSchemas,
  orderSchemas,
  chatSchemas,
  uploadSchemas
};

