import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },  
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cart',
      required: true
    },  
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      required: true
    },  
    isTransactionComplete: {
      type: Boolean,
      default: false // Assuming payment is not successful by default
    },
    captureId: {
      type: String,
      required: false,
    },
    isPending: {
      type: Boolean,
      default: true 
    },
    isRefunded: {
      type: Boolean,
      default: false 
    },
    isToday: {
      type: Boolean,
      default: false
    },
    isCancelled: {
      type: Boolean,
      default: false
    },
    isRemoved: {
      type: Boolean,
      default: false
    },
    acceptOrNot: {
      type: String,      
      required: false
    },    
    createdAt: {
      type: Date,
      default: Date.now
  }
});


const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;