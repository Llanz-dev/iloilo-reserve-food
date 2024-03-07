import Customer from '../models/customerModel.mjs';
import { hashPassword } from '../utils/helpers.mjs';

export const GETLoginPage = (req, res) => {
  res.render('login');
}

export const GETRegisterPage = async (req, res) => {
  res.render('register');
}

export const POSTRegisterPage = async (req, res) => {
  try {
    // Extract user input from the request body
    const { username, password, reEnterPassword } = req.body;
    
    // Get username
    const existingCustomer = await Customer.findOne({ username: username });
    
    // Check if username is already exists
    if (existingCustomer) {
      return res.send(`${existingCustomer.username} username is already exists`);
    }
  
    // Check if passwords match
    if (password !== reEnterPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    req.body.password = hashedPassword;

    // Create customer document
    await Customer.create(req.body);
    res.render('login');
  } catch (err) {
    return res.status(500).json({ err });
  }
}
