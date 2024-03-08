import express from 'express';
import { GETHomePage } from '../controllers/homeController.mjs';

const router = express.Router();

router.get('/', GETHomePage);

export default router;
