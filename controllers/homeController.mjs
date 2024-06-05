import Restaurant from '../models/restaurantModel.mjs';
import Product from '../models/productModel.mjs';
import CustomerQuota from '../models/customerQuotaModel.mjs';
import Cart from '../models/cartModel.mjs';

const GETHomePage = async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        const customer = res.locals.customer;
        const customerQuota = await CustomerQuota.find({ customer: customer }).populate('restaurant');
        const filteredCustomerQuota = customerQuota.filter(quota => quota.restaurant); // Filter out null restaurants
        const pageTitle = 'Home';

        const currentDate = new Date();
        const currentTime = currentDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        console.log("currentTime:", currentTime);
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const currentDayIndex = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
        const targetDay = days[currentDayIndex];

        // Calculate isRestaurantOpen without saving back to the database
        restaurants.forEach(restaurant => {
            console.log('Name:', restaurant.name);
            const foundDay = restaurant.openingHours.find(dayInfo => dayInfo.day === targetDay);
            restaurant.isRestaurantOpen = isRestaurantOpen(foundDay, currentTime);
        });

        res.render('home/home', { pageTitle, restaurants, customerQuota: filteredCustomerQuota, currentTime, targetDay });
    } catch (err) {
        res.json({ 'GET home page': err.message });
    }
}

// Helper function to determine if the restaurant is open
function isRestaurantOpen(dayInfo, currentTime) {
    if (!dayInfo || !dayInfo.isOpen) return false;
    const [currentHours, currentMinutes] = currentTime.split(':').map(Number);
    const [openHours, openMinutes] = dayInfo.open.split(':').map(Number);
    const [closeHours, closeMinutes] = dayInfo.close.split(':').map(Number);

    const currentTimeInMinutes = currentHours * 60 + currentMinutes;
    const openTimeInMinutes = openHours * 60 + openMinutes;
    const closeTimeInMinutes = closeHours * 60 + closeMinutes;

    return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes <= closeTimeInMinutes;
}


const GETRestaurantProductsPage = async (req, res) => {
    try {
        const restaurantLowerName = req.params.lowername;
        console.log('restaurantLowerName:', restaurantLowerName);
        const restaurant = await Restaurant.findOne({ lowername: restaurantLowerName });

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const restaurantID = restaurant._id;
        const products = await Product.find({ restaurant: restaurantID }).populate('category restaurant');
        const customerID = res.locals.customer ? res.locals.customer._id : null;

        // Find the cart for the customer and restaurant combination
        let cart = null;
        if (customerID) {
            cart = await Cart.findOne({ customer: customerID, restaurant: restaurantID, isHalfPaymentSuccessful: false });
        }

        const numberOfItems = cart ? cart.items.length : 0;
        const pageTitle = restaurant.name;
        res.render('home/restaurant-products', { pageTitle, restaurant, products, cart, numberOfItems, restaurantID });
    } catch (err) {
        res.json({ 'GET restaurant products page': err.message });
    }
}


export { GETHomePage, GETRestaurantProductsPage };
