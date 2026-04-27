import express from 'express';
import { register, login, logout, getMe, changePassword } from '../controllers/auth.controller';
import { authLimiter } from '../middlewares/rateLimit.middleware';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);


export default router;
