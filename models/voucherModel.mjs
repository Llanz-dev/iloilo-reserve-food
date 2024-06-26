import mongoose from 'mongoose';

const voucherSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },    
    voucherLabel: {
        type: String,
        default: 'Loyalty'
    },
    isUsed: {
        type: Boolean,
        default: false,
        required: true
    },    
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Voucher = mongoose.model('Voucher', voucherSchema);

export default Voucher;