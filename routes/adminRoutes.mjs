import express from 'express';
import { GETAdminRestaurantList, GETAddRestaurant, POSTAddRestaurant, GETUpdateRestaurant, DELETERestaurant, GETDeactivateRestaurant, GETActivateRestaurant,
    GETAdminCustomerList,
    POSTAdminRestaurantUpdate,
    GETUpdateCustomer,
    POSTAdminCustomerUpdate,
    GETAdminCustomerTransactions,
    GETAdminCustomerHistory,
    DELETETransaction,
    DELETECustomer
 } from '../controllers/adminController.mjs'
import { requireAuthentication } from '../middleware/authenticationMiddleware.mjs';
import { uploadRestaurantBanner, updateRestaurantBanner } from '../config/multerConfig.mjs';
const router = express.Router();

router.get('/', GETAdminRestaurantList);
// Customers
router.get('/customers', GETAdminCustomerList);
router.get('/update-customer/:id', GETUpdateCustomer);
router.post('/update-customer/:id', POSTAdminCustomerUpdate);
router.get('/customer-transactions/:id', GETAdminCustomerTransactions);
router.delete('/customer-delete-history/:id', DELETETransaction);
router.get('/customer-history/:id', GETAdminCustomerHistory);
router.delete('/delete-customer/:id', DELETECustomer);

router.get('/restaurant-registration', GETAddRestaurant);
router.post('/restaurant-registration', uploadRestaurantBanner, POSTAddRestaurant);
// Update Restaurant
router.get('/update-restaurant/:id', GETUpdateRestaurant);
router.post('/update-restaurant/:id', uploadRestaurantBanner, POSTAdminRestaurantUpdate);
// Deactivate or Activate Restaurant
router.get('/deactivate-restaurant/:id', GETDeactivateRestaurant);
router.get('/activate-restaurant/:id', GETActivateRestaurant);
// Delete Restaurant
router.delete('/delete-restaurant/:id', DELETERestaurant);

export default router;