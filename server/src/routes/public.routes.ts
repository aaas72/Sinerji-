import express from 'express';
import { getStats, getLatestTasks } from '../controllers/public.controller';

const router = express.Router();

router.get('/stats', getStats);
router.get('/tasks', getLatestTasks);

export default router;
