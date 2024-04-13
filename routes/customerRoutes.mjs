import express from 'express';
import { GETLoginPage, GETRegisterPage, POSTLoginPage, POSTRegisterPage, GETProfilePage, GETCartPage, POSTAddToCart, POSTRemoveFromCart, POSTUpdateProfile, POSTUpdateCart, GETLogout } from '../controllers/customerController.mjs';
import { requireAuthentication } from '../middleware/authenticationMiddleware.mjs';
const router = express.Router();

router.get('/login', GETLoginPage);
router.post('/login', POSTLoginPage);
router.get('/register', GETRegisterPage);
router.post('/register', POSTRegisterPage);
router.get('/profile', requireAuthentication, GETProfilePage);
router.post('/profile/:id', requireAuthentication, POSTUpdateProfile);
router.post('/update-cart', requireAuthentication, POSTUpdateCart);
router.post('/add-to-cart', requireAuthentication, POSTAddToCart); // Route for adding product to cart
router.post('/remove-from-cart', requireAuthentication, POSTRemoveFromCart);
// Route to handle reservation creation
router.get('/cart/:id', requireAuthentication, GETCartPage);
router.get('/logout', requireAuthentication, GETLogout);
    
export default router;
