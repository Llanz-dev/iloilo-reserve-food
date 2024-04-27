import PayPal from 'paypal-rest-sdk';
import Transaction from '../models/transactionModel.mjs'; // Import your Transaction model

const initiatePayPalRefund = async (transactionId) => {
    try {
        // Retrieve the transaction details
        const transaction = await Transaction.findById(transactionId).populate('customer');

        // Configure PayPal SDK
        PayPal.configure({
            mode: 'sandbox', // or 'live'
            client_id: process.env.PAYPAL_CLIENT_ID,
            client_secret: process.env.PAYPAL_CLIENT_SECRET
        });

        // Retrieve PayPal payment details
        const paymentDetails = await PayPal.payment.get(transaction.customer.captureId);

        // Create a refund request
        const refundRequest = {
            amount: {
                total: transaction.cart.halfAmount.toFixed(2),
                currency: 'PHP'
            },
            reason: 'Reservation Cancellation'
        };

        // Initiate the refund
        const refund = await PayPal.refund.create(paymentDetails.id, refundRequest);

        // Update the transaction status to reflect the refund
        transaction.isRefunded = true;
        await transaction.save();

        return { success: true, refund };
    } catch (error) {
        console.error('Error initiating PayPal refund:', error);
        return { success: false, error: error.message };
    }
};

export { initiatePayPalRefund };
