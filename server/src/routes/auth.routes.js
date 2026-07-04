// routes 
import {Router} from 'express';
const router = Router();

import {registerUser, loginUser, logoutUser, userDetails, updateUser} from '../controllers/auth.controller.js';
import {authMiddleware} from '../middlewares/auth.middleware.js';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.get('/user/dashboard', authMiddleware, userDetails);
router.patch('/user', authMiddleware, updateUser);

export default router;