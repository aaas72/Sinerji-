import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();
const controller = new PaymentController();

router.post('/sub-merchant', controller.createSubMerchant.bind(controller));
router.post('/checkout', controller.initializePayment.bind(controller));
router.post('/release', controller.releaseEscrow.bind(controller));
router.post('/cancel', controller.cancelPayment.bind(controller));

export default router;
