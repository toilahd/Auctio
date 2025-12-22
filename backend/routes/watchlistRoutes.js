// routes/watchlistRoutes.js
import express from 'express';
import watchlistController from '../controllers/watchlistController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.post('/', watchlistController.addToWatchlist);
router.delete('/:productId', watchlistController.removeFromWatchlist);
router.get('/', watchlistController.getWatchlist);
router.get('/check/:productId', watchlistController.checkWatchlist);

export default router;

