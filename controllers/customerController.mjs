import Customer from '../models/customerModel.mjs';
import Cart from '../models/cartModel.mjs';
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

// Function to handle GET request for cart page
// Function to handle GET request for cart page
const GETCartPage = async (req, res) => {
  try {
    // Retrieve the customer's ID from the authenticated user object
    const customerID = res.locals.customer ? res.locals.customer._id : null;
    console.log('customerID:', customerID);

    if (!customerID) {
      // If customer ID is not available, render the cart page with an empty cart
      return res.render('customer/cart', { pageTitle: 'Cart', cartItems: [] });
    }

    // Fetch cart items for the logged-in customer
    const cart = await Cart.findOne({ customer: customerID }).populate('items.product');

    if (!cart) {
      // If cart is empty, render the cart page with an empty cart
      return res.render('customer/cart', { pageTitle: 'Cart', cartItems: [] });
    }

    // If cart has items, render the cart page with cart items
    res.render('customer/cart', { pageTitle: 'Cart', cartItems: cart.items });
  } catch (err) {
    // Handle any errors that occur during fetching cart items
    res.status(500).json({ error: err.message });
  }
};

// Function to handle POST request for adding product to cart
const POSTAddToCart = async (req, res) => {
  console.log('---- POSTAddToCart ----');
  try {
    // Retrieve product ID from request body
    const productId = req.body.productId;
    console.log('productId:', productId);

    // Retrieve the customer ID from res.locals.customer
    const customerId = res.locals.customer ? res.locals.customer._id : null;
    console.log('res.locals.customer:', res.locals.customer);

    // Check if customer ID is available
    if (!customerId) {
      // Handle case where customer ID is not available (e.g., customer not authenticated)
      return res.status(401).json({ error: 'Customer not authenticated' });
    }

    // Find the cart for the customer or create a new one if it doesn't exist
    let cart = await Cart.findOne({ customer: customerId });
    if (!cart) {
      cart = new Cart({
        customer: customerId,
        items: []
      });
    }

    // Check if the product is already in the cart
    const existingItemIndex = cart.items.findIndex(item => {
      console.log('item.product:', item.product);
      console.log('productId:', productId);
      return item.product.equals(productId); // Assuming productId is a MongoDB ObjectId
    });
    console.log('existingItemIndex:', existingItemIndex);
    if (existingItemIndex !== -1) {
      // If the product already exists in the cart, increment its quantity
      cart.items[existingItemIndex].quantity += 1;
    } else {
      // If the product doesn't exist in the cart, add it with a quantity of 1
      cart.items.push({ product: productId, quantity: 1 });
    }

    // Save the updated cart
    await cart.save();

    // Redirect or send response as needed
    res.redirect('/cart'); // Redirect to the cart page
  } catch (err) {
    // Handle errors
    console.error('Error adding product to cart:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const POSTRemoveFromCart = async (req, res) => {
  try {
    // Retrieve product ID from request body
    const productId = req.body.productId;

    // Retrieve the customer ID from res.locals.customer
    const customerId = res.locals.customer ? res.locals.customer._id : null;

    // Check if customer ID is available
    if (!customerId) {
      // Handle case where customer ID is not available (e.g., customer not authenticated)
      return res.status(401).json({ error: 'Customer not authenticated' });
    }

    // Find the cart for the customer
    const cart = await Cart.findOne({ customer: customerId });

    // If cart doesn't exist, return an error
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Remove the item from the cart
    cart.items = cart.items.filter(item => item.product != productId);

    // Save the updated cart
    await cart.save();

    // Redirect or send response as needed
    res.redirect('/cart'); // Redirect to the cart page
  } catch (err) {
    // Handle errors
    console.error('Error removing product from cart:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const GETLogout = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/');
}

export { GETLoginPage, POSTLoginPage, GETRegisterPage, POSTRegisterPage, GETProfilePage, POSTUpdateProfile, GETCartPage, POSTAddToCart, POSTRemoveFromCart, GETLogout };