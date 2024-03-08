import Customer from '../models/customerModel.mjs';
import { hashPassword, comparePassword } from '../utils/helpers.mjs';

const handleErrors = (err) => {
  let errors = { username: '', fullname: '', age: '', password: '' };
  if (err.message.includes('Customer validation failed')) {
    Object.values(err.errors).forEach(({properties}) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
}

export const GETLoginPage = (req, res) => {
  res.render('login');
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

export const GETRegisterPage = async (req, res) => {
  res.render('register');
}

const toTitleCase = (getUsername, getFullname) => {
  const usernameAndFullname = { username: '', fullname: '' };
  usernameAndFullname.username = getUsername.toLowerCase().split('').map(char => char.toUpperCase() === char ? char : char.toLowerCase()).join('');;
  usernameAndFullname.fullname = getFullname.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');;
  return usernameAndFullname;
}

export const POSTRegisterPage = async (req, res) => {
  try {
    // Extract user input from the request body
    const { username, password, reEnterPassword } = req.body;
    
    // Get username
    const existingCustomer = await Customer.findOne({ username: username });
    
    // Check if username is already exists
    if (existingCustomer) {
      return res.status(409).send(`${existingCustomer.username} username is already exists`);
    }
  
    // Check if passwords match
    if (password !== reEnterPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    req.body.username = toTitleCase(req.body.username, req.body.fullname).username;
    req.body.fullname = toTitleCase(req.body.username, req.body.fullname).fullname;

    // Hash password
    const hashedPassword = await hashPassword(password);
    req.body.password = hashedPassword;

    // Create customer document
    await Customer.create(req.body);
    res.render('login');
  } catch (err) {
    const errors = handleErrors(err);
    console.log('Post register ERROR');
    return res.status(500).json({ errors });
  }
}

