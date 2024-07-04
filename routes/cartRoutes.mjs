import express from 'express';
import { GETCartPage, POSTAddToCart, POSTRemoveFromCart, POSTUpdateCart } from '../controllers/cartController.mjs';
import { requireAuthentication } from '../middleware/authenticationMiddleware.mjs';
const router = express.Router();
import checkRestaurantMiddleware from '../middleware/checkRestaurantMiddleware.mjs';

router.get('/cart/:lowername', requireAuthentication, checkRestaurantMiddleware, GETCartPage);
router.post('/update-cart', requireAuthentication, POSTUpdateCart);
router.post('/add-to-cart', requireAuthentication, POSTAddToCart); // Route for adding product to cart
router.post('/remove-from-cart', requireAuthentication, POSTRemoveFromCart);

export default router;
