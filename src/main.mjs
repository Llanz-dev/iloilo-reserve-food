import express from 'express';
import { connectDB } from '../config/database.mjs';

// Routes
import customerRoutes from '../routes/customerRoutes.mjs';
import homeRoutes from '../routes/homeRoutes.mjs'
import adminRoutes from '../routes/adminRoutes.mjs'
import restaurantRoutes from '../routes/restaurantRoutes.mjs'
import reservationRoutes from '../routes/reservationRoutes.mjs';
import paymentRoutes from '../routes/paymentRoutes.mjs';
import checkoutRoutes from '../routes/checkoutRoutes.mjs';
import transactionRoutes from '../routes/transactionRoutes.mjs';
import cartRoutes from '../routes/cartRoutes.mjs';
import { requireAuthentication, checkCustomer, checkRestaurant } from '../middleware/authenticationMiddleware.mjs';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
const app = express();
const PORT = process.env.PORT || 5000;

// set JSON
app.use(express.json());
// set urlencoded
app.use(express.urlencoded({ extended: false }));
// set cookie parser
app.use(cookieParser());
// set EJS 
app.set('view engine', 'ejs');
// set static file
app.use(express.static('public'));
// set bootstrap CSS and JS
app.use('/bootstrapcss', express.static('node_modules/bootstrap/dist/css'));
app.use('/bootstrapjs', express.static('node_modules/bootstrap/dist/js'));
// Connect to mongoDB
connectDB();

// check user
app.use('*', checkCustomer);
// set routes
app.use('/', homeRoutes);
app.use(customerRoutes);
app.use(cartRoutes);
app.use('/reservation', requireAuthentication, reservationRoutes);
app.use('/payment', requireAuthentication, paymentRoutes);
app.use('/checkout', requireAuthentication, checkoutRoutes);
app.use('/transaction', transactionRoutes);
app.get('*', checkRestaurant);
app.use('/restaurant', restaurantRoutes);
app.use('/adminux', adminRoutes);

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
});