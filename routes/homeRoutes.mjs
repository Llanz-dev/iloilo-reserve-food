import express from 'express';
import { GETHomePage, GETRestaurantPage } from '../controllers/homeController.mjs';

const router = express.Router();

router.get('/', GETHomePage);
router.get('/restaurant-products/:id', GETRestaurantPage);

export default router;
