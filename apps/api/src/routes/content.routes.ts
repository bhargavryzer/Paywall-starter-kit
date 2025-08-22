
import express from 'express';
import { getProtectedContent, getFreeContent } from '../controllers/content.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/free', getFreeContent);
router.get('/protected', protect, getProtectedContent);

export default router;
