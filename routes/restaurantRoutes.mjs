import express from 'express';
const router = express.Router();
import { uploadRestaurantBanner, updateRestaurantBanner } from '../config/multerConfig.mjs';
import {    POSTUpdateRestaurant,
            GETrestaurantRegister, 
            POSTrestaurantRegister,
            GETrestaurantLogin,
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
            GETRestaurantLogout, GETUpdateCategory, POSTUpdateCategory, DELETECategory, DELETETransaction, GETHistory, GETRemoveTransaction, GETDeactivateCategory, GETActivateCategory } from '../controllers/restaurantController.mjs';
import { requireAuthenticationRestaurant } from '../middleware/authenticationMiddleware.mjs';
import { uploadProductImage, updateProductImage } from '../config/multerConfig.mjs'
import voucherRoutes from './voucherRoutes.mjs';

router.get('/register', GETrestaurantRegister);
router.post('/register', uploadRestaurantBanner, POSTrestaurantRegister);
router.get('/', GETrestaurantLogin);
router.post('/', POSTRestaurantLogin);
router.get('/dashboard', requireAuthenticationRestaurant, GETRestaurantDashboard);
router.get('/update-restaurant', requireAuthenticationRestaurant, GETProfileDashboard);
router.post('/update-restaurant/:id', requireAuthenticationRestaurant, updateRestaurantBanner, POSTUpdateRestaurant);
router.get('/products', requireAuthenticationRestaurant, GETProducts);
// Vouchers
router.use('/vouchers', requireAuthenticationRestaurant, voucherRoutes)
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
router.get('/deactivate-category/:id', requireAuthenticationRestaurant, GETDeactivateCategory);
router.get('/activate-category/:id', requireAuthenticationRestaurant, GETActivateCategory);
router.delete('/delete-category/:id', requireAuthenticationRestaurant, DELETECategory);
// Update products
router.get('/update-product/:id', requireAuthenticationRestaurant, GETUpdateProduct);
router.post('/update-product/:id', requireAuthenticationRestaurant, updateProductImage, POSTUpdateProduct);
// Delete product
router.delete('/delete-product/:id', requireAuthenticationRestaurant, DELETEProduct);
// Transactions
router.get('/remove-transaction/:id', requireAuthenticationRestaurant, GETRemoveTransaction);
router.get('/delete-transaction/:id', requireAuthenticationRestaurant, DELETETransaction);
// For logout
router.get('/logout', GETRestaurantLogout);

export default router;