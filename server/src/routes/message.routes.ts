import express from 'express';
import { getContacts, getMessages, sendMessage, deleteMessage, getUnreadCount } from '../controllers/message.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

// Protect all message routes
router.use(protect);

router.get('/contacts', getContacts);
router.get('/unread-count', getUnreadCount);
router.get('/:userId', getMessages);
router.post('/', sendMessage);
router.delete('/:id', deleteMessage);

export default router;
