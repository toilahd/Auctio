// middlewares/authMiddleware.js
// JWT authentication middleware

import { getLogger } from '../config/logger.js';
import { decodeJwt } from '../utils/jwtUtil.js';

const logger = getLogger('AuthMiddleware');

/**
 * Authenticate user using JWT from cookies or Authorization header
 * Requires valid access token
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // Try to get token from cookie first
    let token = req.cookies?.access;

    // If not in cookie, check Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      logger.warn('No authentication token provided');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    // Decode and verify token
    const { payload: user, error } = decodeJwt(token);

    if (error || !user) {
      logger.warn('Invalid or expired token:', error?.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please log in again.'
      });
    }

    // Attach user to request
    req.user = user;
    logger.debug(`User authenticated: ${user.email} (${user.role})`);

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Alias for consistency
export const authenticate = authenticateToken;

export default {
  authenticateToken,
  authenticate
};

