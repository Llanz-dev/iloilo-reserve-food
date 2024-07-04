import express from 'express';
import { GETHomePage, GETRestaurantProductsPage } from '../controllers/homeController.mjs';
import checkRestaurantMiddleware from '../middleware/checkRestaurantMiddleware.mjs';

const router = express.Router();

router.get('/', GETHomePage);
router.get('/restaurant-products/:lowername', checkRestaurantMiddleware, GETRestaurantProductsPage);

export default router;
