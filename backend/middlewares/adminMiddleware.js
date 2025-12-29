import { getLogger } from '../config/logger.js';

const logger = getLogger('AdminMiddleware');

export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'ADMIN') {
    logger.warn(`Unauthorized admin access attempt by user ${req.user.id}`);
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

export const requireSeller = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'SELLER' && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Seller access required'
    });
  }

  next();
};

export const requireBidder = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'BIDDER' && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Bidder access required'
    });
  }

  next();
};

export default {
  requireAdmin,
  requireSeller,
  requireBidder
};

