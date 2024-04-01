import Customer from '../models/customerModel.mjs';
import { hashPassword, comparePassword, handleErrors, toTitleCase, toSmallerCase, createToken, fourtyEightHours } from '../utils/helpers.mjs';

const GETLoginPage = (req, res) => {
    const pageTitle = 'login';
    res.render('customer/login', { pageTitle });
}

const POSTLoginPage = async (req, res) => {
  try {
    // Get username
    const customer = await Customer.findOne({ username: req.body.username });
    // Check if username exists
    if (!customer) {
      throw new Error('Incorrect username');
    } 

    const fromDatabasePassword = req.body.password;
    const currentPasswordInput = customer.password;

    // Compare passwords
    const isPasswordMatch = await comparePassword(fromDatabasePassword, currentPasswordInput);

    // Check if password is wrong
    if (!isPasswordMatch) {
      throw new Error('Incorrect password');
    }

    const token = createToken(customer._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: fourtyEightHours * 1000 });
    res.status(200).json({ customer: customer._id });
  } catch (err) {
    const errors = handleErrors(err);
    console.log(errors);
    return res.status(400).json({ errors });
  }
}

const GETRegisterPage = (req, res) => {
  const pageTitle = 'register';
  res.render('customer/register', { pageTitle });
}

const POSTRegisterPage = async (req, res) => {
  try {
    // Extract user input from the request body
    const { password, reEnterPassword } = req.body;
  
    // Check if passwords match
    if (password !== reEnterPassword) {
      throw new Error('Passwords do not match');
    }

    // Format the strings 
    req.body.username = toSmallerCase(req.body.username);
    req.body.fullname = toTitleCase(req.body.fullname);

    // Hash password
    const hashedPassword = await hashPassword(password);
    req.body.password = hashedPassword;

    // Create customer document
    const customer = await Customer.create(req.body);
    const token = createToken(customer._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: fourtyEightHours * 1000 });
    res.status(201).json({ customer: customer._id });
  } catch (err) {
    const errors = handleErrors(err);
    return res.status(500).json({ errors });
  }
}

const GETProfilePage = (req, res) => {
  const pageTitle = 'profile';
  res.render('customer/profile', { pageTitle });
}

const POSTUpdateProfile = async (req, res) => {
  try {
    const customerID = req.params.id;
    let { username, fullname, age, password, reEnterPassword } = req.body;

    if (password !== reEnterPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Format the strings 
    username = toSmallerCase(username);
    fullname = toTitleCase(fullname);
  
    const updates = { username, fullname, age };
    
    if (password) {       
      // Hash password
      const hashedPassword = await hashPassword(password);
      updates.password = hashedPassword;
    }

    await Customer.findByIdAndUpdate(customerID, updates);

    res.redirect('/');
  } catch (err) {
    res.json({ 'PATCH profile page': err.message });
  }
}

const GETLogout = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/');
}

export { GETLoginPage, POSTLoginPage, GETRegisterPage, POSTRegisterPage, GETProfilePage, POSTUpdateProfile, GETLogout };