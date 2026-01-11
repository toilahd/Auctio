// routes/watchlistRoutes.js
import express from 'express';
import watchlistController from '../controllers/watchlistController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import getUserFromJwt from '../utils/getUserFromJwtMiddleware.js';
import { validate, watchlistSchemas } from '../middlewares/validationMiddleware.js';

const router = express.Router();

// All routes require authentication
// router.use(authenticate);
router.use(getUserFromJwt);

router.post('/', validate(watchlistSchemas.addToWatchlist), watchlistController.addToWatchlist);
router.delete('/:productId', validate(watchlistSchemas.removeFromWatchlist), watchlistController.removeFromWatchlist);
router.get('/', watchlistController.getWatchlist);
router.get('/check/:productId', validate(watchlistSchemas.checkWatchlist), watchlistController.checkWatchlist);

export default router;

