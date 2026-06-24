// routes 
import {Router} from 'express';
const router = Router();

import {registerUser, loginUser, logoutUser, userDetails} from '../controllers/auth.controller.js';
import {authMiddleware} from '../middlewares/auth.middleware.js';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.get('/user/dashboard', authMiddleware, userDetails);

export default router;