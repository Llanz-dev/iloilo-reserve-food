import express from 'express';
const router = express.Router();
import { uploadRestaurantBanner, updateRestaurantBanner } from '../config/multerConfig.mjs';
import {    
            POSTacceptTransactionOrNot,
            GETnumberPax,
            POSTnumberPax,
            GETdeactivateOrActivate,
            GETupdateNumberPax,
            POSTupdateNumberPax,
            DELETEnumberPax,
            POSTUpdateRestaurant,
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
            POSTUpdateCategory, DELETECategory, GETHistory,
            GETRemoveTransaction, GETDeactivateCategory, GETActivateCategory, POSTtransactionComplete, GETRestaurantDashboardToday, GETRestaurantDashboardPending, GETHistoryCompleted, GETHistoryCancelled } from '../controllers/restaurantController.mjs';
import { requireAuthenticationRestaurant } from '../middleware/authenticationMiddleware.mjs';
import { uploadProductImage, updateProductImage, uploadFloorPlanImage } from '../config/multerConfig.mjs'
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
router.get('/dashboard/today', GETRestaurantDashboardToday);
router.get('/dashboard/pending', GETRestaurantDashboardPending);
router.get('/update-restaurant', GETProfileDashboard);
router.post('/update-restaurant/:id', updateRestaurantBanner, POSTUpdateRestaurant);
// Accept or Not the Transaction
router.post('/accept-transaction-or-not/:id', POSTacceptTransactionOrNot);
// Vouchers
router.use('/vouchers', voucherRoutes);
// Number of Pax
router.get('/number-of-pax', GETnumberPax);
router.post('/number-of-pax/:id', uploadFloorPlanImage, POSTnumberPax);
router.get('/deactivate-or-activate', GETdeactivateOrActivate);
router.get('/update-number-of-pax/:id', GETupdateNumberPax);
router.post('/update-number-of-pax/:id', uploadFloorPlanImage, POSTupdateNumberPax);
router.delete('/delete-number-of-pax/:id', DELETEnumberPax);
// View history
router.get('/history', GETHistory);
router.get('/history/completed', GETHistoryCompleted);
router.get('/history/cancelled', GETHistoryCancelled);
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
// Add product
router.get('/add-product', GETAddProduct);
router.post('/add-product', uploadProductImage, POSTAddProduct);
// Update products
router.get('/update-product/:id', GETUpdateProduct);
router.post('/update-product/:id', updateProductImage, POSTUpdateProduct);
// Delete product
router.delete('/delete-product/:id', DELETEProduct);
// Transactions
router.get('/remove-transaction/:id', GETRemoveTransaction);
router.post('/transaction-complete/:id', POSTtransactionComplete);

export default router;