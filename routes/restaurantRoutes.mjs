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
            GETRestaurantLogout, 
            GETUpdateCategory, 
            POSTUpdateCategory, DELETECategory, DELETETransaction, GETHistory, GETRemoveTransaction, GETDeactivateCategory, GETActivateCategory, POSTtransactionComplete } from '../controllers/restaurantController.mjs';
import { requireAuthenticationRestaurant } from '../middleware/authenticationMiddleware.mjs';
import { uploadProductImage, updateProductImage } from '../config/multerConfig.mjs'
import voucherRoutes from './voucherRoutes.mjs';

// Register and Login
router.get('/register', GETrestaurantRegister);
router.post('/register', uploadRestaurantBanner, POSTrestaurantRegister);
router.get('/', GETrestaurantLogin);
router.post('/', POSTRestaurantLogin);
// For logout
router.get('/logout', GETRestaurantLogout);
// Dashboard.
router.use(requireAuthenticationRestaurant);
router.get('/dashboard', GETRestaurantDashboard);
router.get('/update-restaurant', GETProfileDashboard);
router.post('/update-restaurant/:id', updateRestaurantBanner, POSTUpdateRestaurant);
// Vouchers
router.use('/vouchers', voucherRoutes)
// View history
router.get('/history', GETHistory);
// Add product
router.get('/add-product', GETAddProduct);
router.post('/add-product', uploadProductImage, POSTAddProduct);
// Categories
router.get('/add-category', GETAddCategory);
router.post('/add-category', POSTAddCategory);
router.get('/update-category/:id', GETUpdateCategory);
router.post('/update-category/:id', POSTUpdateCategory);
router.get('/deactivate-category/:id', GETDeactivateCategory);
router.get('/activate-category/:id', GETActivateCategory);
router.delete('/delete-category/:id', DELETECategory);
// View products
router.get('/products', GETProducts);
// Update products
router.get('/update-product/:id', GETUpdateProduct);
router.post('/update-product/:id', updateProductImage, POSTUpdateProduct);
// Delete product
router.delete('/delete-product/:id', DELETEProduct);
// Transactions
router.get('/remove-transaction/:id', GETRemoveTransaction);
router.get('/delete-transaction/:id', DELETETransaction);
router.post('/transaction-complete/:id', POSTtransactionComplete);

export default router;