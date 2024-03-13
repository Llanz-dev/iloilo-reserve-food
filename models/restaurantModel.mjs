import mongoose from "mongoose";
const { Schema } = mongoose;

const restaurantSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minLength: 5,
        maxLength: 40
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
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
      }]
});

export default mongoose.model('Restaurant', restaurantSchema);
