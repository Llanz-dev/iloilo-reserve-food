import mongoose from "mongoose";
const { Schema } = mongoose;

const restaurantSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minLength: 5,
        maxLength: 40
    },
    name: {
        type: String,
        required: true,
        unique: true,
        minLength: 5,
        maxLength: 40
    },
    lowername: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: String,
    address: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    statusIsActive: {
        type: Boolean,
        default: true // Assuming payment is not successful by default
      }
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;
