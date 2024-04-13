import express from 'express';
const router = express.Router();
import { GETCreateReservation, POSTCreateReservation } from '../controllers/reservationController.mjs';

router.get('/:id', GETCreateReservation);
router.post('/:id', POSTCreateReservation);

export default router;
