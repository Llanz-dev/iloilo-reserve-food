import express from 'express';
const router = express.Router();
import { GETtransaction, cancelReservation } from '../controllers/transactionController.mjs';
import { requireAuthentication } from '../middleware/authenticationMiddleware.mjs';

router.use(requireAuthentication);
router.get('/', GETtransaction);
router.get('/cancel/:id', cancelReservation);

export default router;
