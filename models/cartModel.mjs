// Import necessary modules
import mongoose from 'mongoose';

// Define schema for cart item
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1 // Default quantity to 1
  }
});

// Define schema for cart
const cartSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  items: [cartItemSchema] // Array of cart items
}, {
  versionKey: false, 
});

// Create model for cart
const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
