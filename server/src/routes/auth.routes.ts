import express from 'express';
import { register, login, logout, getMe, changePassword, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { authLimiter } from '../middlewares/rateLimit.middleware';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);

router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

export default router;
