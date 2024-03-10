import Customer from '../models/customerModel.mjs';
import jwt from 'jsonwebtoken';

const requireAuthentication = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) return res.redirect('/login');

    jwt.verify(token, 'token secret code', (err, decodedToken) => {
        if (err) return res.redirect('/login');
        
        console.log('requireAuthentication of decodedToken', decodedToken);
        next();
    });
}

const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        res.locals.customer = null;
        console.log('Hello');
        next();
    } 

    jwt.verify(token, 'token secret code', async (err, decodedToken) => {
        if (err) {
            console.log('err.message:', err.message);
            res.locals.customer = null;
            next();
        } else {
            console.log('checkUser of decodedToken', decodedToken);
            let customer = await Customer.findById(decodedToken.id);
            console.log('customer:', customer);
            res.locals.customer = customer;
            next();
        }        
    });
}

export { requireAuthentication, checkUser };