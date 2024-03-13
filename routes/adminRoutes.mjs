import express from 'express';
import { GETAdminPage } from '../controllers/adminController.mjs'
const router = express.Router();

router.get('/', GETAdminPage);

export default router;