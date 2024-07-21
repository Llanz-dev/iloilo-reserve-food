import Restaurant from '../models/restaurantModel.mjs';
import Product from '../models/productModel.mjs';
import CustomerQuota from '../models/customerQuotaModel.mjs';
import Cart from '../models/cartModel.mjs';
import moment from 'moment-timezone';
import { isRestaurantOpen } from '../utils/restaurantUtils.mjs';

const GETHomePage = async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        const customer = res.locals.customer;
        const customerQuota = await CustomerQuota.find({ customer: customer }).populate('restaurant');      
        const filteredCustomerQuota = customerQuota.filter(quota => quota.restaurant); // Filter out null restaurants
        const pageTitle = 'Home';
        const currentDate = new Date();
        // Use Moment Timezone to get the current time in the Asia/Manila timezone
        const currentTime = moment().tz('Asia/Manila').format('HH:mm'); // 24-hour format
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const currentDayIndex = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
        const targetDay = days[currentDayIndex];

        // This will check if restaurant is open or not.
        restaurants.forEach( async (restaurant) => {
            const foundDay = restaurant.openingHours.find(dayInfo => dayInfo.day === targetDay);
            restaurant.isRestaurantOpen = isRestaurantOpen(foundDay, currentTime);
            await restaurant.save();
        });

        res.render('home/home', { pageTitle, restaurant: undefined, restaurants, customerQuota: filteredCustomerQuota, currentTime, targetDay });
    } catch (err) {
        res.json({ 'GET home page': err.message });
    }
}

const GETRestaurantProductsPage = async (req, res) => {
    try {
        const restaurantLowerName = req.params.lowername;
        const restaurant = await Restaurant.findOne({ lowername: restaurantLowerName });

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const restaurantID = restaurant._id;
        let searchCriteria = { restaurant: restaurantID };

        // Search
        const filter = req.query;        
        if (filter.name) {
            // Use regular expression for partial matching
            searchCriteria.name = { $regex: filter.name, $options: 'i' }; // case-insensitive
        }

        // Fetch the products based on the search criteria
        const products = await Product.find(searchCriteria).populate('category restaurant');
        const customerID = res.locals.customer ? res.locals.customer._id : null;

        // Find the cart for the customer and restaurant combination
        let cart = null;
        if (customerID) {
            cart = await Cart.findOne({ customer: customerID, restaurant: restaurantID, isHalfPaymentSuccessful: false });
        }

        const numberOfItems = cart ? cart.items.length : 0;
        const pageTitle = restaurant.name;

        res.render('home/restaurant-products', { pageTitle, restaurant, products, cart, numberOfItems, restaurantID, filter });
    } catch (err) {
        res.json({ 'GET restaurant products page': err.message });
    }
}

const GETsearchProduct = async (req, res) => {
    try {
        const filter = req.query;
        console.log('filter:', filter);

        // Create a search criteria object
        let searchCriteria = {};

        // Example: Adding filter conditions for product name and category
        if (filter.name) {
            // Use regular expression for partial matching
            searchCriteria.name = { $regex: filter.name, $options: 'i' }; // case-insensitive
        }
        if (filter.category) {
            searchCriteria.category = filter.category;
        }
        if (filter.restaurant) {
            searchCriteria.restaurant = filter.restaurant;
        }

        // Add more filters as needed
        if (filter.priceMin || filter.priceMax) {
            searchCriteria.price = {};
            if (filter.priceMin) {
                searchCriteria.price.$gte = parseFloat(filter.priceMin);
            }
            if (filter.priceMax) {
                searchCriteria.price.$lte = parseFloat(filter.priceMax);
            }
        }

        // Fetch the products based on the search criteria
        const products = await Product.find(searchCriteria).populate('category restaurant');

        res.json({ products, filter });
    } catch (err) {
        res.status(500).json({ 'GET search product': err.message });
    }
}


export { GETHomePage, GETRestaurantProductsPage, GETsearchProduct };
