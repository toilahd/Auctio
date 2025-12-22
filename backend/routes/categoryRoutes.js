// routes/categoryRoutes.js
import express from 'express';
import categoryController from '../controllers/categoryController.js';

const router = express.Router();

// Two-level category menu
router.get('/menu', categoryController.getMenu);

export default router;

