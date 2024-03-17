import Restaurant from '../models/restaurantModel.mjs';
import { hashPassword, comparePassword, handleErrors, toTitleCase, createToken, fourtyEightHours } from '../utils/helpers.mjs';

const GETrestaurantLogin = async (req, res) => {
    const pageTitle = 'Restaurant';
    res.render('restaurant/login', { pageTitle });
};

const POSTRestaurantLogin = async (req, res) => {
    try {
        // Get restaurant
        console.log('req.body.username:', req.body.username);
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

const GETRestaurantDashboard = (req, res) => {
    const pageTitle = 'Dashboard';
    res.render('restaurant/dashboard', { pageTitle });
};

const GETProfileDashboard = async (req, res) => {
    const pageTitle = 'Profile';
    res.render('restaurant/profile', { pageTitle });
}

const GETRestaurantLogout = (req, res) => {
    // Clear the restaurantToken cookie
    res.clearCookie('restaurantToken');
    // Redirect the restaurant admin to the login page or any other appropriate page
    res.redirect('/restaurant');
};

export { GETrestaurantLogin, POSTRestaurantLogin, GETRestaurantDashboard, GETProfileDashboard, GETRestaurantLogout };
