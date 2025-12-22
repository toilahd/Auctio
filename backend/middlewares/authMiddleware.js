// middlewares/authMiddleware.js
// Simple auth middleware for testing - bypasses real JWT validation

import { getLogger } from '../config/logger.js';

const logger = getLogger('AuthMiddleware');


/**
 * Mock authentication middleware for testing
 *
 * Usage: Add header "X-Mock-User: bidder1" to requests
 * Valid users: bidder1, bidder2, bidder3, bidder4, seller1
 */
import prisma from '../config/prisma.js';

export const authenticateToken = async (req, res, next) => {
  const mockUserKey = req.headers['x-mock-user'];
  if (!mockUserKey) {
    return res.status(401).json({ message: 'Missing X-Mock-User' });
  }

  const email = `${mockUserKey}@example.com`;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return res.status(401).json({
      message: `Mock user ${mockUserKey} not found in database`
    });
  }

  req.user = user;
  return next();
};

// Alias for consistency
export const authenticate = authenticateToken;

export default {
  authenticateToken,
  authenticate
};

