import express from 'express';
import { GETLoginPage, GETRegisterPage, POSTRegisterPage, POSTLoginPage } from '../controllers/customerController.mjs';
const router = express.Router();

router.get('/', GETLoginPage);
router.post('/login', POSTLoginPage);
router.get('/register', GETRegisterPage);
router.post('/register', POSTRegisterPage);

export default router;