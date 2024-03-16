import express from 'express';
const router = express.Router();
import { GETrestaurantLogin, POSTrestaurantLogin, GETRestaurantDashboard } from '../controllers/restaurantController.mjs';
import { requireAuthenticationRestaurant } from '../middleware/authenticationMiddleware.mjs';

router.get('/', GETrestaurantLogin);
router.post('/', POSTrestaurantLogin);
router.post('/dashboard', requireAuthenticationRestaurant, GETRestaurantDashboard);

export default router;