import Cart from '../models/cartModel.mjs';
import Reservation from '../models/reservationModel.mjs';
import Product from '../models/productModel.mjs';
import Voucher from '../models/voucherModel.mjs';
import Restaurant from '../models/restaurantModel.mjs';

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
  
      // Fetch the restaurant
      const restaurant = await Restaurant.findById(restaurantId);
  
      // Fetch cart items for the logged-in customer
      const cart = await Cart.findOne({ customer: customerID, restaurant: restaurantId, isHalfPaymentSuccessful: false }).populate({ path: 'items.product', populate: [{ path: 'category' }, { path: 'restaurant' }]});
        
      const numberOfItems = cart ? cart.items.length : 0;
      let subTotal = 0;
      let totalAmount = 0;
  
      const customer = res.locals.customer;
  
      const vouchers = await Voucher.find({ customer: customer._id, restaurant: restaurant, isUsed: false });
      console.log('vouchers:', vouchers);
  
      // If cart is empty, render the cart page with an empty cart
      if (!cart) {
        return res.render('cart/cart', { pageTitle: 'Cart', cartItems: [], cartID: 0, subTotal, numberOfItems, restaurant, vouchers: [], totalAmount });
      }
      
      const cartID = cart._id;
  
      subTotal = cart.subTotal;
      totalAmount = cart.totalAmount;
      
      // If cart has items, render the cart page with cart items
      res.render('cart/cart', { pageTitle: 'Cart', cart: cart, cartItems: cart.items, cartID, subTotal, numberOfItems, restaurant, vouchers, totalAmount });
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
        subTotal: productPrice,
        totalAmount: productPrice,
        items: []
      });
    }

    // Check if the product is already in the cart
    const existingItemIndex = cart.items.findIndex(item => {
      return item.product.equals(productId); // Assuming productId is a MongoDB ObjectId
    });

    // If the product already exists in the cart, increment its quantity and subTotal
    if (existingItemIndex !== -1) {
      cart.items[existingItemIndex].quantity += 1;
      cart.subTotal += productPrice;
      cart.totalAmount += productPrice;
      cart.halfAmount += halfAmount;
      cart.items[existingItemIndex].total *= cart.items[existingItemIndex].quantity;
    } else {
      // If the product does exist in the cart, add it with a quantity of 1
      // Increment the subTotal when adding a new item to the cart
      if (cart.items.length) {
        cart.subTotal += productPrice;
        cart.totalAmount += productPrice;
        cart.halfAmount += halfAmount;
        cart.items.push({ product: productId, quantity: 1, total: product.price * 1, totalAmount: productPrice, subTotal: productPrice, halfAmount: halfAmount });
      } else {
        // If the product doesn't exist in the cart, add it with a quantity of 1
        cart.items.push({ product: productId, quantity: 1, total: product.price * 1, totalAmount: productPrice, subTotal: productPrice, halfAmount: halfAmount });
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

    // This will decrease the subTotal of the cart if you click the remove button.
    cart.subTotal -= amountOfProduct;
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
    console.log('------------------ POSTUpdateCart:', cart);
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
        cart.items[productIndex].total = cart.items[productIndex].quantity * productPrice;
        cart.subTotal += productPrice;
        cart.totalAmount += productPrice;
        cart.halfAmount += halfAmount;
    } else if (cart.items[productIndex].quantity === 1 && cart.items.length === 1 && action === 'decrease') {
        cart.subTotal -= productPrice;
        cart.totalAmount -= productPrice;
        cart.halfAmount -= halfAmount;
        cart.items[productIndex].total -= cart.items[productIndex].quantity;
        return await POSTRemoveFromCart(req, res);
    } else if (cart.items[productIndex].quantity === 1 && action === 'decrease') {
        cart.subTotal -= productPrice;
        cart.totalAmount -= productPrice;
        cart.halfAmount -= halfAmount;
        cart.items[productIndex].total -= productPrice;
        cart.items.splice(productIndex, 1);
    } else if (action === 'decrease') {
        cart.subTotal -= productPrice;
        cart.totalAmount -= productPrice;
        cart.halfAmount -= halfAmount;
        cart.items[productIndex].quantity -= 1;
        cart.items[productIndex].total -= productPrice;
    }

    // Save the updated cart
    await cart.save();

    // Send success response
    res.redirect(`/cart/${restaurantId}`); // Redirect to the cart page
  } catch (err) {
    // Handle errors
    console.error('Error updating cart:', err);
    res.status(500).json({ error: err });
  }
};

export { GETCartPage, POSTAddToCart, POSTRemoveFromCart, POSTUpdateCart };