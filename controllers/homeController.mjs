import Restaurant from '../models/restaurantModel.mjs';
import Product from '../models/productModel.mjs';

const GETHomePage = async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        const pageTitle = 'home';
        res.render('home/home', { pageTitle, restaurants });
    } catch (err) {
        res.json({ 'GET home page': err.message });
    }
}

const GETRestaurantPage = async (req, res) => {
    try {
        const restaurantID = req.params.id;
        const restaurant = await Restaurant.findById(restaurantID);
        const products = await Product.find({ restaurant: restaurantID }).populate('category restaurant');
        console.log(products);
        const pageTitle = restaurant.name;
        res.render('home/restaurant', { pageTitle, restaurant, products });
    } catch (err) {
        res.json({ 'GET home page': err.message });
    }
}

export { GETHomePage, GETRestaurantPage };
