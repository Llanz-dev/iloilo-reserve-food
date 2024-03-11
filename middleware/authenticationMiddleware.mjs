import Customer from '../models/customerModel.mjs';
import jwt from 'jsonwebtoken';

const requireAuthentication = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) return res.redirect('/login');

    jwt.verify(token, 'token secret code', (err, decodedToken) => {
        if (err) return res.redirect('/login');
        
        next();
    });
}

const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        res.locals.customer = null;
        next();
    } 

    jwt.verify(token, 'token secret code', async (err, decodedToken) => {
        if (err) {
            res.locals.customer = null;
            next();
        } else {
            let customer = await Customer.findById(decodedToken.id);
            res.locals.customer = customer;
            console.log('res.locals.customer:', res.locals.customer);
            next();
        }        
    });
}

export { requireAuthentication, checkUser };