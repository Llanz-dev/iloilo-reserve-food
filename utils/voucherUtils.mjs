import Transaction from "../models/transactionModel.mjs";
import Voucher from "../models/voucherModel.mjs";

const voucherGenerator = async (transactionId) => {
    try {
        const transaction = await Transaction.findById(transactionId).populate('customer cart restaurant');
        const threePercent = 0.03;
        const discountAmount = (transaction.cart.totalAmount * threePercent).toFixed(2);
        const voucher = await Voucher.create({ amount: discountAmount, customer: transaction.customer, restaurant: transaction.restaurant });
        transaction.isTransactionComplete = true;
        await transaction.save();
        return voucher;
    } catch (err) {
        console.error('voucherGenerator:', err)
        throw new Error({ 'Voucher Generator' : err });
    }
}

export default voucherGenerator;