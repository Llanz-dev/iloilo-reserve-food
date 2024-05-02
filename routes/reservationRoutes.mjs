import express from 'express';
const router = express.Router();
import { GETCreateReservation, POSTCreateReservation, GETUseVoucher } from '../controllers/reservationController.mjs';

router.get('/:id', GETCreateReservation);
router.post('/:id', POSTCreateReservation);
router.get('/use-voucher/:cartId/:voucherId', GETUseVoucher);

export default router;
