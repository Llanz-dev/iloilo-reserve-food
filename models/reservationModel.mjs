import mongoose from "mongoose";
const { Schema } = mongoose;

// Define schema for reservation
const reservationSchema = new Schema({
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
    reservation_date: {
      type: Date,
      required: true
    },
    reservation_time: {
      type: String,
      required: true
    },
    num_pax: {
      type: Number,
      required: true
    },
    notes: String
  }, {
    versionKey: false 
  });
  
  // Create model for reservation
export default mongoose.model('Reservation', reservationSchema);
  