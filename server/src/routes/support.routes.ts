import { Router } from 'express';
import { SupportController } from '../controllers/support.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();
const supportController = new SupportController();

router.use(protect);

router.post('/', supportController.createTicket);
router.get('/', supportController.getMyTickets);

export default router;
