import mongoose from "mongoose";
const { Schema } = mongoose;

const openingHoursSchema = new Schema({
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
    },
    open: {
        type: String,
        required: false
    },
    close: {
        type: String,
        required: false
    },
    isOpen: {
        type: Boolean,
        default: true
    }
}, { _id: false });

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
    quotaVoucher: {
        type: Number,
        default: 5000
    },
    percentageVoucher: {
        type: Number,
        default: 3,
    },
    calculatedVoucherThreshold: {
        type: Number,
        default: 150
    },   
    statusIsActive: {
        type: Boolean,
        default: false 
    },    
    customerQuota: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CustomerQuota'
    },
    openingHours: {
        type: [openingHoursSchema],
        required: false
    },
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;
