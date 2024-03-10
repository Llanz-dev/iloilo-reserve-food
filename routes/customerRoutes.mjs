import express from 'express';
import { GETLoginPage, GETRegisterPage, POSTLoginPage, POSTRegisterPage } from '../controllers/customerController.mjs';
const router = express.Router();

router.get('/login', GETLoginPage);
router.post('/login', POSTLoginPage);
router.get('/register', GETRegisterPage);
router.post('/register', POSTRegisterPage);

export default router;
