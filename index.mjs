import express from 'express';
import { connectDB } from './config/database.mjs';

// Routes
import customerRoutes from './routes/customerRoutes.mjs';
import homeRoutes from './routes/homeRoutes.mjs';
import adminRoutes from './routes/adminRoutes.mjs';
import restaurantRoutes from './routes/restaurantRoutes.mjs';
import reservationRoutes from './routes/reservationRoutes.mjs';
import paymentRoutes from './routes/paymentRoutes.mjs';
import checkoutRoutes from './routes/checkoutRoutes.mjs';
import transactionRoutes from './routes/transactionRoutes.mjs';
import cartRoutes from './routes/cartRoutes.mjs';

import { requireAuthentication, checkCustomer, checkRestaurant } from './middleware/authenticationMiddleware.mjs';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

const app = express();

// WebSocket
import http from 'http';
import { WebSocketServer } from 'ws';
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 5000;
console.log('process.env.PORT:', process.env.PORT);

// Set JSON
app.use(express.json());
// Set urlencoded
app.use(express.urlencoded({ extended: false }));
// Set cookie parser
app.use(cookieParser());
// Set EJS 
app.set('view engine', 'ejs');
// Set static file
app.use(express.static('public'));
// Set bootstrap CSS and JS
app.use('/bootstrapcss', express.static('node_modules/bootstrap/dist/css'));
app.use('/bootstrapjs', express.static('node_modules/bootstrap/dist/js'));

// Connect to MongoDB
connectDB();

// Check user
app.use('*', checkCustomer);
// Set routes
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

wss.on('connection', (ws) => {
    console.log('Client connected');
    
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

server.listen(PORT, (err) => {
    if (err) {
        console.error('Failed to start server:', err);
    } else {
        console.log(`Index Server is listening on ${PORT}`);
    }
});

// Export the app and WebSocket server for use in other files
export { app, wss, server };
