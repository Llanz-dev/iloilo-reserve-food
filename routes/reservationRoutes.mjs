import express from 'express';
const router = express.Router();
import { GETDineInTakeOutReservation, POSTDineInTakeOutReservation, GETCreateDineInReservation, POSTCreateDineInReservation, GETCreateTakeOutReservation } from '../controllers/reservationController.mjs';
import checkRestaurantMiddleware from '../middleware/checkRestaurantMiddleware.mjs';

router.get('/:lowername/:id', checkRestaurantMiddleware, GETCreateDineInReservation);
router.post('/:lowername/:id', checkRestaurantMiddleware, POSTCreateDineInReservation);
router.get('/dineIn-takeOut/:lowername/:id', checkRestaurantMiddleware, GETDineInTakeOutReservation);
router.post('/dineIn-takeOut/:lowername/:id', checkRestaurantMiddleware, POSTDineInTakeOutReservation);
router.get('/take-out/:lowername/:id', checkRestaurantMiddleware, GETCreateTakeOutReservation);
router.post('/take-out/:lowername/:id', checkRestaurantMiddleware, GETCreateTakeOutReservation);
router.post('/:lowername/:id', checkRestaurantMiddleware, GETCreateTakeOutReservation);

export default router;
