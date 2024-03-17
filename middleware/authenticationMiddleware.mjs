import Customer from '../models/customerModel.mjs';
import jwt from 'jsonwebtoken';
import Restaurant from '../models/restaurantModel.mjs';

const requireAuthentication = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) return res.redirect('/login');

    jwt.verify(token, 'token secret code', (err, decodedToken) => {
        if (err) return res.redirect('/login');
        
        next();
    });
}

const requireAuthenticationRestaurant = (req, res, next) => {
    const token = req.cookies.restaurantToken;
    console.log('token resto:', token);
    if (!token) return res.redirect('/restaurant');

    jwt.verify(token, 'token secret code', (err, decodedToken) => {
        if (err) return res.redirect('/restaurant');
        
        next();
    });
}

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
                    console.log('res.locals.customer:', res.locals.customer);
                    next();
                } catch (error) {
                    console.error('Error finding customer:', error);
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
                    console.log('res.locals.restaurant:', res.locals.restaurant);
                    next();
                } catch (error) {
                    console.error('Error finding restaurant:', error);
                    res.locals.restaurant = null;
                    next();
                }
            }
        });
    }
}


export { requireAuthentication, requireAuthenticationRestaurant, checkCustomer, checkRestaurant };