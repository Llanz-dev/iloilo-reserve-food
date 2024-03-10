import Customer from '../models/customerModel.mjs';
import { hashPassword, comparePassword, handleErrors, toTitleCase, createToken, fourtyEightHours } from '../utils/helpers.mjs';

export const GETLoginPage = (req, res) => {
  const pageTitle = 'login';
  res.render('login', { pageTitle });
}

export const POSTLoginPage = async (req, res) => {
  try {
    // Get username
    const customer = await Customer.findOne({ username: req.body.username });
    // Check if username exists
    if (!customer) {
      return res.send(`${customer.username} username is already exists`);
    }

    // Compare passwords
    const isPasswordMatch = await comparePassword(req.body.password, customer.password);

    // Check if password is wrong
    if (!isPasswordMatch) {
      return res.send('Wrong password');
    }
    
    res.redirect('/home');
  } catch (err) {
    return res.status(500).json({ 'wrong username': err });
  }
}

export const GETRegisterPage = (req, res) => {
  const pageTitle = 'register';
  res.render('register', { pageTitle });
}

export const POSTRegisterPage = async (req, res) => {
  const pageTitle = 'register';
  try {
    // Extract user input from the request body
    const { password, reEnterPassword } = req.body;
  
    // Check if passwords match
    if (password !== reEnterPassword) {
      throw new Error('Passwords do not match');
    }

    // Format the strings 
    req.body.username = toTitleCase(req.body.username, req.body.fullname).username;
    req.body.fullname = toTitleCase(req.body.username, req.body.fullname).fullname;

    // Hash password
    const hashedPassword = await hashPassword(password);
    req.body.password = hashedPassword;

    // Create customer document
    const customer = await Customer.create(req.body);
    const token = createToken(customer._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: fourtyEightHours * 1000 });
    res.status(201).json({ user: customer._id });
  } catch (err) {
    const errors = handleErrors(err);
    return res.status(500).json({ errors });
  }
}
