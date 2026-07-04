import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { getTodayPriorities } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/priorities', authMiddleware, getTodayPriorities);

export default router;
