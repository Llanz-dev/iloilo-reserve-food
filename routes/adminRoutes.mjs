import express from 'express';
import { GETAdminPage, GETRestaurantRegistration, POSTRestaurantRegistration } from '../controllers/adminController.mjs'
const router = express.Router();

router.get('/', GETAdminPage);
router.get('/restaurant-registration', GETRestaurantRegistration);
router.post('/restaurant-registration', POSTRestaurantRegistration);

export default router;