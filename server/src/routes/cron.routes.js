import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { triggerCronJobs } from '../controllers/cron.controller.js';

const router = Router();

router.post('/trigger', authMiddleware, triggerCronJobs);

export default router;
