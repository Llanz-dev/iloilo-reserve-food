import express from 'express';
import { createOrderHandler, serveCheckoutPage, captureOrderHandler } from '../controllers/checkoutController.mjs'
const router = express.Router();
import checkRestaurantMiddleware from '../middleware/checkRestaurantMiddleware.mjs';


router.get("/:lowername/:restaurantID/:cartID", checkRestaurantMiddleware, serveCheckoutPage);
router.post("/api/orders", createOrderHandler);
router.post("/api/orders/:orderID/capture", captureOrderHandler);

export default router;
