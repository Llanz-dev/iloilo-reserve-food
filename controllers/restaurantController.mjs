import Restaurant from '../models/restaurantModel.mjs';
import { hashPassword, comparePassword, handleErrors, toTitleCase, createToken, fourtyEightHours } from '../utils/helpers.mjs';

const GETrestaurantLogin = async (req, res) => {
    res.send('GETrestaurantLogin');
};

const POSTrestaurantLogin = async (req, res) => {
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

const GETRestaurantDashboard = async (req, res) => {
    res.send('GETRestaurantDashboard zzzzzzzzzz');
};

export { GETrestaurantLogin, POSTrestaurantLogin, GETRestaurantDashboard };
