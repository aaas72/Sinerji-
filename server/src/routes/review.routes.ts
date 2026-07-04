import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();
const reviewController = new ReviewController();

router.use(protect);

// Company routes
router.post('/submission/:submissionId', restrictTo('company'), reviewController.createReview);

// Shared routes
router.get('/submission/:submissionId', reviewController.getReview);

// Student routes
router.post('/company/:submissionId', restrictTo('student'), reviewController.createCompanyReview);

export default router;
