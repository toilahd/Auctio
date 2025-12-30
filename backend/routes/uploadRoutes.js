import express from 'express';
import multer from 'multer';
import uploadController from '../controllers/uploadController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import getUserFromJwt from '../utils/getUserFromJwtMiddleware.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 10, // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, WEBP allowed'), false);
    }
  },
});

// All upload routes require authentication
// router.use(authenticate);
router.use(getUserFromJwt);

/**
 * POST /api/upload/images
 * Upload product images
 */
router.post('/images', upload.array('images', 10), uploadController.uploadImages);

export default router;
