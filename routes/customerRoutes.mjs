import express from 'express';
import { GETLoginPage, GETRegisterPage, POSTRegisterPage } from '../controllers/customerController.mjs';
const router = express.Router();

router.get('/', GETLoginPage);
router.get('/register', GETRegisterPage);
router.post('/register', POSTRegisterPage);

export default router;