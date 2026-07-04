import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
    connectGoogle,
    disconnectGoogle,
    getGoogleConnectionStatus,
    handleGoogleCallback
} from '../controllers/google.controller.js';

const router = Router();

// Start the Google OAuth flow for the authenticated user.
router.get('/connect', authMiddleware, connectGoogle);

// Google redirects here after the user approves the consent screen.
router.get('/callback', handleGoogleCallback);

// Return the current Google connection status for the authenticated user.
router.get('/status', authMiddleware, getGoogleConnectionStatus);

// Disconnect the Google account and clear stored tokens.
router.post('/disconnect', authMiddleware, disconnectGoogle);

export default router;

