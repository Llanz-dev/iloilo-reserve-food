import express from 'express';
const router = express.Router();

import { GETvoucherPage, POSTsetQuotaAmount, POSTsetPercentageValue } from '../controllers/voucherController.mjs'

router.get('/', GETvoucherPage);
router.post('/set-quota', POSTsetQuotaAmount);
router.post('/set-percentage', POSTsetPercentageValue);

export default router;
