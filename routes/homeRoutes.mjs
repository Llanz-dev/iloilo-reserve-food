import express from 'express';
import { GETHomePage, GETRestaurantProductsPage } from '../controllers/homeController.mjs';

const router = express.Router();

router.get('/', GETHomePage);
router.get('/restaurant-products/:id', GETRestaurantProductsPage);

export default router;
