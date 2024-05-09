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
    notes: String,
    created_at: {
      type: Date,
      default: () => {
        const philippinesTimezoneOffset = 8; // UTC+8 for Philippine Standard Time
        const now = new Date();
        const utcTimestamp = now.getTime();
        const philippinesTimestamp = utcTimestamp + philippinesTimezoneOffset * 60 * 60 * 1000; // Convert hours to milliseconds
        return new Date(philippinesTimestamp);
      }
    }
  }, {
    versionKey: false 
  });
  
// Create model for reservation
export default mongoose.model('Reservation', reservationSchema);