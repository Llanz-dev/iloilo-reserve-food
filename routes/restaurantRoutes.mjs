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
            GETUpdateProduct, 
            GETAddCategory, 
            POSTAddCategory, 
            DELETEProduct,
            GETRestaurantLogout, GETUpdateCategory, POSTUpdateCategory, DELETECategory, DELETETransaction, POSTtransactionComplete, GETHistory, GETRemoveTransaction } from '../controllers/restaurantController.mjs';
import { requireAuthenticationRestaurant } from '../middleware/authenticationMiddleware.mjs';
import { uploadProductImage, updateProductImage } from '../config/multerConfig.mjs'

router.get('/', GETrestaurantLogin);
router.post('/', POSTRestaurantLogin);
router.get('/dashboard', requireAuthenticationRestaurant, GETRestaurantDashboard);
router.get('/profile', requireAuthenticationRestaurant, GETProfileDashboard);
router.get('/products', requireAuthenticationRestaurant, GETProducts);
// View history
router.get('/history', requireAuthenticationRestaurant, GETHistory);
// Add product
router.get('/add-product', requireAuthenticationRestaurant, GETAddProduct);
router.post('/add-product', requireAuthenticationRestaurant, uploadProductImage, POSTAddProduct);
// Categories
router.get('/add-category', requireAuthenticationRestaurant, GETAddCategory);
router.post('/add-category', requireAuthenticationRestaurant, POSTAddCategory);
router.get('/update-category/:id', requireAuthenticationRestaurant, GETUpdateCategory);
router.post('/update-category/:id', requireAuthenticationRestaurant, POSTUpdateCategory);
router.delete('/delete-category/:id', requireAuthenticationRestaurant, DELETECategory);
// Update products
router.get('/update-product/:id', requireAuthenticationRestaurant, GETUpdateProduct);
router.post('/update-product/:id', requireAuthenticationRestaurant, updateProductImage, POSTUpdateProduct);
// Delete product
router.delete('/delete-product/:id', requireAuthenticationRestaurant, DELETEProduct);
// Transactions
router.get('/remove-transaction/:id', requireAuthenticationRestaurant, GETRemoveTransaction);
router.get('/delete-transaction/:id', requireAuthenticationRestaurant, DELETETransaction);
router.post('/transaction-complete/:id', requireAuthenticationRestaurant, POSTtransactionComplete);
// For logout
router.get('/logout', GETRestaurantLogout);

export default router;