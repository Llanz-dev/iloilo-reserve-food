import express from 'express';
const router = express.Router();
import { GETrestaurantLogin, POSTRestaurantLogin, GETRestaurantDashboard, GETProfileDashboard, GETAddProduct, POSTAddProduct, POSTUpdateProduct, GETProducts, GETUpdateProduct, DELETEProduct, GETRestaurantLogout } from '../controllers/restaurantController.mjs';
import { requireAuthenticationRestaurant } from '../middleware/authenticationMiddleware.mjs';
import { uploadProductImage } from '../config/multerConfig.mjs'

router.get('/', GETrestaurantLogin);
router.post('/', POSTRestaurantLogin);
router.get('/dashboard', requireAuthenticationRestaurant, GETRestaurantDashboard);
router.get('/profile', requireAuthenticationRestaurant, GETProfileDashboard);
// Add product
router.get('/add-product', requireAuthenticationRestaurant, GETAddProduct);
router.post('/add-product', requireAuthenticationRestaurant, uploadProductImage, POSTAddProduct);
// Update product
router.post('/update-product/:id', requireAuthenticationRestaurant, uploadProductImage, POSTUpdateProduct);
// View products or product
router.get('/products', requireAuthenticationRestaurant, GETProducts);
router.get('/products/:id', requireAuthenticationRestaurant, GETUpdateProduct);
// Delete product
router.delete('/delete-product/:id', requireAuthenticationRestaurant, DELETEProduct);
// For logout
router.get('/logout', GETRestaurantLogout);

export default router;