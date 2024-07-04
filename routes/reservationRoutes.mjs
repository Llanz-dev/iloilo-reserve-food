import express from 'express';
const router = express.Router();
import { GETDineInTakeOutReservation, POSTDineInTakeOutReservation, GETCreateDineInReservation, POSTCreateDineInReservation, GETCreateTakeOutReservation } from '../controllers/reservationController.mjs';
import checkRestaurantMiddleware from '../middleware/checkRestaurantMiddleware.mjs';

router.get('/:lowername/:id', GETCreateDineInReservation);
router.post('/:lowername/:id', POSTCreateDineInReservation);
router.get('/dineIn-takeOut/:lowername/:id', GETDineInTakeOutReservation);
router.post('/dineIn-takeOut/:lowername/:id', POSTDineInTakeOutReservation);
router.get('/take-out/:lowername/:id', GETCreateTakeOutReservation);
router.post('/take-out/:lowername/:id', GETCreateTakeOutReservation);
router.post('/:lowername/:id', GETCreateTakeOutReservation);

export default router;
