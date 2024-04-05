import express from 'express';
const router = express.Router();
import { GETrestaurantLogin,
         POSTRestaurantLogin,
         GETRestaurantDashboard,
         GETProfileDashboard,
         GETAddProduct,
         POSTAddProduct,
         POSTUpdateProduct,
         GETProducts,
         GETUpdateProduct, GETAddCategory, POSTAddCategory, DELETEProduct, GETRestaurantLogout, DELETECategory } from '../controllers/restaurantController.mjs';
import { requireAuthenticationRestaurant } from '../middleware/authenticationMiddleware.mjs';
import { uploadProductImage, updateProductImage } from '../config/multerConfig.mjs'

router.get('/', GETrestaurantLogin);
router.post('/', POSTRestaurantLogin);
router.get('/dashboard', requireAuthenticationRestaurant, GETRestaurantDashboard);
router.get('/profile', requireAuthenticationRestaurant, GETProfileDashboard);
// Add product
router.get('/add-product', requireAuthenticationRestaurant, GETAddProduct);
router.post('/add-product', requireAuthenticationRestaurant, uploadProductImage, POSTAddProduct);
// Update product
router.post('/update-product/:id', requireAuthenticationRestaurant, updateProductImage, POSTUpdateProduct);
// Categories
router.get('/add-category', requireAuthenticationRestaurant, GETAddCategory);
router.post('/add-category', requireAuthenticationRestaurant, POSTAddCategory);
router.delete('/delete-category/:id', requireAuthenticationRestaurant, DELETECategory);
// View products or product
router.get('/products', requireAuthenticationRestaurant, GETProducts);
router.get('/update-products/:id', requireAuthenticationRestaurant, GETUpdateProduct);
// Delete product
router.delete('/delete-product/:id', requireAuthenticationRestaurant, DELETEProduct);
// For logout
router.get('/logout', GETRestaurantLogout);

export default router;