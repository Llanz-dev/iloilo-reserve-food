import express from 'express';
const router = express.Router();
import { GETtransaction, cancelReservationRefundable, cancelReservationUnrefundable } from '../controllers/transactionController.mjs';
import { requireAuthentication } from '../middleware/authenticationMiddleware.mjs';

router.use(requireAuthentication);
router.get('/', GETtransaction);
router.get('/cancel-reservation-refundable/:id', cancelReservationRefundable);
router.get('/cancel-reservation-unrefundable/:id', cancelReservationUnrefundable);

export default router;
