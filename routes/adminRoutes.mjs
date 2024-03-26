import express from 'express';
import { GETAdminPage, GETAddRestaurant, POSTAddRestaurant, GETUpdateRestaurant, POSTUpdateRestaurant, DELETERestaurant } from '../controllers/adminController.mjs'
import { uploadRestaurantBanner } from '../config/multerConfig.mjs';
const router = express.Router();


router.get('/', GETAdminPage);
router.get('/restaurant-registration', GETAddRestaurant);
router.post('/restaurant-registration', uploadRestaurantBanner, POSTAddRestaurant);
// Update Restaurant
router.get('/update-restaurant/:id', GETUpdateRestaurant);
router.post('/update-restaurant/:id', uploadRestaurantBanner, POSTUpdateRestaurant);

// Delete Restaurant
router.delete('/delete-restaurant/:id', DELETERestaurant);


export default router;