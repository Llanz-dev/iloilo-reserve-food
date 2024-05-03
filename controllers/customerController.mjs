import Customer from '../models/customerModel.mjs';
import Cart from '../models/cartModel.mjs';
import Reservation from '../models/reservationModel.mjs';
import Product from '../models/productModel.mjs';
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
    console.log('POSTRegisterPage');
    const { password, reEnterPassword } = req.body;
    console.log('password:', password);
    console.log('reEnterPassword:', reEnterPassword);
  
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
    console.log('POSTRegisterPage');
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
    let { username, fullname, dateOfBirth, password, reEnterPassword } = req.body;

    if (password !== reEnterPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Format the strings 
    username = toSmallerCase(username);
    fullname = toTitleCase(fullname);
  
    const updates = { username, fullname, dateOfBirth };
    
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

const GETCartPage = async (req, res) => {
  console.log('---- GETCartPage ----');
  try {
    // Retrieve the customer's ID from the authenticated user object
    const customerID = res.locals.customer ? res.locals.customer._id : null;
    const restaurantId = req.params.id;

    // If customer ID is not available, render the cart page with an empty cart
    if (!customerID) {
      return res.render('customer/cart', { pageTitle: 'Cart', cartItems: [] });
    }

    // Fetch cart items for the logged-in customer
    const cart = await Cart.findOne({ customer: customerID, restaurant: restaurantId, isHalfPaymentSuccessful: false }).populate('items.product');
    
    const numberOfItems = cart ? cart.items.length : 0;
    let cartAmount = 0;

    // If cart is empty, render the cart page with an empty cart
    if (!cart) {
      return res.render('customer/cart', { pageTitle: 'Cart', cartItems: [], cartID: 0, cartAmount, numberOfItems });
    }
    const cartID = cart._id;

    cartAmount = cart.totalAmount;
    
    // If cart has items, render the cart page with cart items
    res.render('customer/cart', { pageTitle: 'Cart', cartItems: cart.items, cartID, cartAmount, numberOfItems });
  } catch (err) {
    // Handle any errors that occur during fetching cart items
    res.status(500).json({ error: err.message });
  }
};

const POSTAddToCart = async (req, res) => {
  console.log('---- POSTAddToCart ----');
  try {
    // Retrieve the customer ID from res.locals.customer
    const customerId = res.locals.customer ? res.locals.customer._id : null;

    // Check if customer ID is available
    if (!customerId) {
      // Handle case where customer ID is not available (e.g., customer not authenticated)
      return res.status(401).json({ error: 'Customer not authenticated' });
    }

    // Retrieve product ID from request body
    const restaurantId = req.body.restaurantId;
    const productId = req.body.productId;

    const product = await Product.findById(productId);
    const productPrice = product.price;
    const halfAmount = productPrice / 2;

    // Find the cart for the customer or create a new one if it doesn't exist
    let cart = await Cart.findOne({ customer: customerId, restaurant: restaurantId, isHalfPaymentSuccessful: false });
    if (!cart) {
      cart = new Cart({
        customer: customerId,
        restaurant: restaurantId,
        halfAmount,
        totalAmount: productPrice,
        items: []
      });
    }

    // Check if the product is already in the cart
    const existingItemIndex = cart.items.findIndex(item => {
      return item.product.equals(productId); // Assuming productId is a MongoDB ObjectId
    });

    if (existingItemIndex !== -1) {
      // If the product already exists in the cart, increment its quantity and totalAmount
      cart.items[existingItemIndex].quantity += 1;
      cart.totalAmount += productPrice;
      cart.halfAmount += halfAmount;
    } else {
      // If the product does exist in the cart, add it with a quantity of 1
      // Increment the totalAmount when adding a new item to the cart
      if (cart.items.length) {
        cart.totalAmount += productPrice;
        cart.halfAmount += halfAmount;
        cart.items.push({ product: productId, quantity: 1, totalAmount: productPrice, halfAmount: halfAmount });
      } else {
        // If the product doesn't exist in the cart, add it with a quantity of 1
        cart.items.push({ product: productId, quantity: 1, totalAmount: productPrice, halfAmount: halfAmount });
      }
    }

    // Save the updated cart
    await cart.save();

    // Redirect or send response as needed
    res.redirect(`/cart/${restaurantId}`); // Redirect to the cart page
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

    const restaurantId = req.body.restaurantId;
    // Find the cart for the customer
    const cart = await Cart.findOne({ customer: customerId, restaurant: restaurantId, isHalfPaymentSuccessful: false });

    // If cart doesn't exist, return an error
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Find the index of the product in the cart items array
    const productIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }
    
    const product = await Product.findById(productId);
    const productPrice = product.price;
    const productQuantity = cart.items[productIndex].quantity;
    const amountOfProduct = productPrice * productQuantity;
    const halfAmount = productPrice / 2;

    // This will decrease the totalAmount of the cart if you click the remove button.
    cart.totalAmount -= amountOfProduct;
    cart.halfAmount -= halfAmount;

    // Remove the item from the cart
    cart.items = cart.items.filter(item => item.product != productId);

    // Save the updated cart
    await cart.save();

    // If there is no items left in cart, then delete the cart and reservation
    const hasItemsLeft = cart.items.length;
    if (!hasItemsLeft) {
      await Reservation.deleteOne({ cart });
      await Cart.deleteOne({ customer: customerId, restaurant: restaurantId, isHalfPaymentSuccessful: false });
    }

    // Redirect or send response as needed
    res.redirect(`/cart/${restaurantId}`); // Redirect to the cart page
  } catch (err) {
    // Handle errors
    console.error('Error removing product from cart:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const POSTUpdateCart = async (req, res) => {
  try {
    const { customerId, restaurantId, productId, action } = req.body;

    // Find the cart for the customer and the specific restaurant
    const cart = await Cart.findOne({ customer: customerId, restaurant: restaurantId, isHalfPaymentSuccessful: false });

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Find the index of the product in the cart items array
    const productIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }
    
    const product = await Product.findById(productId);
    const productPrice = product.price;
    const halfAmount = productPrice / 2;

    // Update the quantity of the product in the cart
    if (action === 'increase') {
        cart.items[productIndex].quantity += 1;
        cart.totalAmount += productPrice;
        cart.halfAmount += halfAmount;
    } else if (cart.items[productIndex].quantity === 1 && cart.items.length === 1 && action === 'decrease') {
        cart.totalAmount -= productPrice;
        cart.halfAmount -= halfAmount;
        return await POSTRemoveFromCart(req, res);
    } else if (cart.items[productIndex].quantity === 1 && action === 'decrease') {
        cart.totalAmount -= productPrice;
        cart.halfAmount -= halfAmount;
        cart.items.splice(productIndex, 1);
    } else if (action === 'decrease') {
        cart.totalAmount -= productPrice;
        cart.halfAmount -= halfAmount;
        cart.items[productIndex].quantity -= 1;
    }

    // Save the updated cart
    await cart.save();

    // Send success response
    res.redirect(`/cart/${restaurantId}`); // Redirect to the cart page
  } catch (err) {
    // Handle errors
    console.error('Error updating cart:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const GETLogout = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/');
}

export { GETLoginPage, POSTLoginPage, GETRegisterPage, POSTRegisterPage, GETProfilePage, POSTUpdateProfile, GETCartPage, POSTAddToCart, POSTRemoveFromCart, POSTUpdateCart, GETLogout };