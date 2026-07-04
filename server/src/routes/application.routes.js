import {Router} from 'express';
const router = Router();

import {authMiddleware} from '../middlewares/auth.middleware.js';
import {
    getApplications,
    createApplication,
    deleteApplication,
    updateApplication,
    getOneApplication,
    generateFollowUpDraft,
    sendFollowUpEmail,
    generateInterviewPrepContent
} from '../controllers/applications.controller.js';
import { interviewPrepUpload } from '../middlewares/upload.middleware.js';

router.get('/', authMiddleware, getApplications);
router.post('/', authMiddleware, createApplication);
router.post('/:id/follow-up/draft', authMiddleware, generateFollowUpDraft);
router.post('/:id/follow-up/send', authMiddleware, sendFollowUpEmail);
router.post('/:id/interview-prep', authMiddleware, (req, res, next) => {
    interviewPrepUpload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
}, generateInterviewPrepContent);
router.delete('/:id',authMiddleware, deleteApplication);
router.patch('/:id',authMiddleware,updateApplication);
router.get('/:id',authMiddleware, getOneApplication);
export default router;
