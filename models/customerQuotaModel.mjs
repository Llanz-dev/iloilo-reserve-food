import mongoose from 'mongoose';

const customerQuotaSchema = new mongoose.Schema({
    valueAmount: {
        type: Number,
        default: 0
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
    }    
});

const CustomerQuota = mongoose.model('CustomerQuota', customerQuotaSchema);
export default CustomerQuota;
