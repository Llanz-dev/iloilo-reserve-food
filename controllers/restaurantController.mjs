import Restaurant from '../models/restaurantModel.mjs';
import Product from '../models/productModel.mjs';
import { hashPassword, comparePassword, handleErrors, toTitleCase, createToken, fourtyEightHours } from '../utils/helpers.mjs';

const GETrestaurantLogin = async (req, res) => {
    const pageTitle = 'Restaurant';
    res.render('restaurant/login', { pageTitle });
};

const POSTRestaurantLogin = async (req, res) => {
    try {
        // Get restaurant
        const restaurant = await Restaurant.findOne({ username: req.body.username });
        // Check if restaurant exists
        if (!restaurant) {
            throw new Error('Incorrect restaurant username');
        }     

        const fromDatabasePassword = req.body.password;
        const currentPasswordInput = restaurant.password;

        // Compare the both passwords between hashed password from database to current password input by restaurant admin.
        const isPasswordMatch = await comparePassword(fromDatabasePassword, currentPasswordInput);

        // Check if password is wrong
        if (!isPasswordMatch) {
            throw new Error('Incorrect password');
        }
        
        const token = createToken(restaurant._id);
        res.cookie('restaurantToken', token, { httpOnly: true, maxAge: fourtyEightHours * 1000 });
        res.redirect('/restaurant/dashboard');
    } catch (err) {
        const errors = handleErrors(err);
        console.log(errors);
        return res.status(400).json({ errors });
    }
};

const GETProducts = async (req, res) => {
    try {
        const restaurantId = req.restaurantID;
        const restaurant = await Restaurant.findById(restaurantId).populate('products');
        
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        const products = restaurant.products;

        const pageTitle = 'Products';
        res.render('restaurant/products', { pageTitle, products });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

const GETProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const pageTitle = 'Product';
        res.render('restaurant/product', { pageTitle, product });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

const GETRestaurantDashboard = (req, res) => {
    const pageTitle = 'Dashboard';
    res.render('restaurant/dashboard', { pageTitle });
};
const GETProfileDashboard = async (req, res) => {
    const pageTitle = 'Profile';
    res.render('restaurant/profile', { pageTitle });
}

const GETAddProduct = (req, res) => {
    const pageTitle = 'Add Product';
    res.render('restaurant/add-product', { pageTitle });
};

const POSTAddProduct = async (req, res) => {
    try {
        const { name, description, price, category } = req.body;
        const restaurantId = req.restaurantID; // Assuming you have restaurant ID in req.restaurantID
        
        // Create a new product and set the restaurant field to the restaurant ID
        const product = await Product.create({
            name,
            description,
            price,
            category,
            restaurant: restaurantId
        });

        // Add the product to the products array of the corresponding restaurant
        await Restaurant.findByIdAndUpdate(restaurantId, { $push: { products: product._id } });

        res.redirect('/restaurant/dashboard'); // Redirect to dashboard after adding product
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};


const GETRestaurantLogout = (req, res) => {
    // Clear the restaurantToken cookie
    res.clearCookie('restaurantToken');
    // Redirect the restaurant admin to the login page or any other appropriate page
    res.redirect('/restaurant');
};


export { GETrestaurantLogin, POSTRestaurantLogin, GETRestaurantDashboard, GETProfileDashboard, GETAddProduct, POSTAddProduct, GETProducts, GETProduct, GETRestaurantLogout };