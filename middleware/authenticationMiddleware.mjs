import Customer from '../models/customerModel.mjs';
import jwt from 'jsonwebtoken';
import Restaurant from '../models/restaurantModel.mjs';

const requireAuthentication = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        console.log('requireAuthentication(): You are not authenticated', token);
        return res.redirect('/login')
    };

    jwt.verify(token, 'token secret code', (err, decodedToken) => {
        if (err) return res.redirect('/login');
        
        next();
    });
}

const requireAuthenticationRestaurant = (req, res, next) => {
    const token = req.cookies.restaurantToken;
    if (!token) return res.redirect('/restaurant');

    jwt.verify(token, 'token secret code', (err, decodedToken) => {
        if (err) return res.redirect('/restaurant');

        // Extract the restaurant ID from the decoded token 
        const restaurantID = decodedToken.id;

        // Attach the restaurant ID to the request object for further processing
        req.restaurantID = restaurantID;

        next();
    });
};

const checkCustomer = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        res.locals.customer = null;
        next();
    } else {
        jwt.verify(token, 'token secret code', async (err, decodedToken) => {
            if (err) {
                res.locals.customer = null;
                next();
            } else {
                try {
                    let customer = await Customer.findById(decodedToken.id);
                    res.locals.customer = customer;
                    next();
                } catch (error) {
                    console.error('Error checkCustomer:', error);
                    res.locals.customer = null;
                    next();
                }
            }
        });
    }
}

const checkRestaurant = (req, res, next) => {
    const token = req.cookies.restaurantToken;
    if (!token) {
        res.locals.restaurant = null;
        next();
    } else {
        jwt.verify(token, 'token secret code', async (err, decodedToken) => {
            if (err) {
                res.locals.restaurant = null;
                next();
            } else {
                try {
                    let restaurant = await Restaurant.findById(decodedToken.id);
                    res.locals.restaurant = restaurant;
                    next();
                } catch (error) {
                    console.error('Error checkRestaurant():', error);
                    res.locals.restaurant = null;
                    next();
                }
            }
        });
    }
}


export { requireAuthentication, requireAuthenticationRestaurant, checkCustomer, checkRestaurant };