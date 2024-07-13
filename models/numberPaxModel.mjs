import mongoose from "mongoose";
import { Schema } from "mongoose";

const numberPaxSchema = new Schema({ 
    name: {
        type: String,
        required: true
    },
    numberOfPax: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    isActivate: {
        type: Boolean,
        required: true,
        default: true
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: false
    },
});

export default mongoose.model('NumberPax', numberPaxSchema);