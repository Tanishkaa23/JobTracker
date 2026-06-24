import {Router} from 'express';
const router = Router();

import {authMiddleware} from '../middlewares/auth.middleware.js';
import {getApplications, createApplication, deleteApplication, updateApplication, getOneApplication} from '../controllers/applications.controller.js';

router.get('/', authMiddleware, getApplications);
router.post('/', authMiddleware, createApplication);
router.delete('/:id',authMiddleware, deleteApplication);
router.patch('/:id',authMiddleware,updateApplication);
router.get('/:id',authMiddleware, getOneApplication);
export default router;