import express from 'express';
const router = express.Router();
import { GETrestaurantLogin, POSTRestaurantLogin, GETRestaurantDashboard, GETProfileDashboard, GETAddProduct, POSTAddProduct, GETProducts, GETProduct, GETRestaurantLogout } from '../controllers/restaurantController.mjs';
import { requireAuthenticationRestaurant } from '../middleware/authenticationMiddleware.mjs';

router.get('/', GETrestaurantLogin);
router.post('/', POSTRestaurantLogin);
router.get('/dashboard', requireAuthenticationRestaurant, GETRestaurantDashboard);
router.get('/profile', requireAuthenticationRestaurant, GETProfileDashboard);
// Add product routes
router.get('/add-product', requireAuthenticationRestaurant, GETAddProduct);
router.post('/add-product', requireAuthenticationRestaurant, POSTAddProduct);
router.get('/products', requireAuthenticationRestaurant, GETProducts);
router.get('/products/:id', requireAuthenticationRestaurant, GETProduct);
router.get('/logout', GETRestaurantLogout);

export default router;