import express from 'express';
const router = express.Router();
import { GETrestaurantLogin, POSTRestaurantLogin, GETRestaurantDashboard, GETProfileDashboard, GETAddProduct, POSTAddProduct, GETProducts, GETProduct, DELETEProduct, GETRestaurantLogout } from '../controllers/restaurantController.mjs';
import { requireAuthenticationRestaurant } from '../middleware/authenticationMiddleware.mjs';

router.get('/', GETrestaurantLogin);
router.post('/', POSTRestaurantLogin);
router.get('/dashboard', requireAuthenticationRestaurant, GETRestaurantDashboard);
router.get('/profile', requireAuthenticationRestaurant, GETProfileDashboard);
// Add product
router.get('/add-product', requireAuthenticationRestaurant, GETAddProduct);
router.post('/add-product', requireAuthenticationRestaurant, POSTAddProduct);
// View products or product
router.get('/products', requireAuthenticationRestaurant, GETProducts);
router.get('/products/:id', requireAuthenticationRestaurant, GETProduct);
// Delete product
router.delete('/delete-product/:id', requireAuthenticationRestaurant, DELETEProduct);
// For logout
router.get('/logout', GETRestaurantLogout);

export default router;