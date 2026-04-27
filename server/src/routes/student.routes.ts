import express from 'express';
import { getMyProfile, updateMyProfile, addSkill, removeSkill, getMyStats, getMatchingStudentsForTask, saveTask, unsaveTask, getSavedTasks } from '../controllers/student.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router.get('/task/:taskId/matches', restrictTo('company'), getMatchingStudentsForTask);

router.use(restrictTo('student'));

router.get('/me', getMyProfile);
router.get('/me/stats', getMyStats);
router.patch('/me', updateMyProfile);
router.post('/skills', addSkill);
router.delete('/skills/:skillId', removeSkill);

// Saved Tasks
router.get('/saved-tasks', getSavedTasks);
router.post('/tasks/:taskId/save', saveTask);
router.delete('/tasks/:taskId/save', unsaveTask);

export default router;
