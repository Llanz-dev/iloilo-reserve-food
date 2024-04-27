import Restaurant from '../models/restaurantModel.mjs';
import Product from '../models/productModel.mjs';
import Cart from '../models/cartModel.mjs';

const GETHomePage = async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        const pageTitle = 'home';
        res.render('home/home', { pageTitle, restaurants });
    } catch (err) {
        res.json({ 'GET home page': err.message });
    }
}

const GETRestaurantProductsPage = async (req, res) => {
    try {
        const restaurantID = req.params.id;
        const restaurant = await Restaurant.findById(restaurantID);
        const products = await Product.find({ restaurant: restaurantID }).populate('category restaurant');
        const customerID = res.locals.customer ? res.locals.customer._id : null;
        
        // Find the cart for the customer and restaurant combination
        let cart = null;
        if (customerID) {
            cart = await Cart.findOne({ customer: customerID, restaurant: restaurantID, isHalfPaymentSuccessful: false });
        }
        
        const numberOfItems = cart ? cart.items.length : 0;
        const pageTitle = restaurant.name;
        res.render('home/restaurant-products', { pageTitle, restaurant, products, cart, numberOfItems });
    } catch (err) {
        res.json({ 'GET home page': err.message });
    }
}


export { GETHomePage, GETRestaurantProductsPage };
