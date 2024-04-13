import express from 'express';
const router = express.Router();
import { GETPayment } from '../controllers/paymentController.mjs';

router.get('/:id', GETPayment);

export default router;
