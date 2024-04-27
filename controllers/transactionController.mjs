import Transaction from '../models/transactionModel.mjs'
import { initiatePayPalRefund } from '../utils/paypalRefund.mjs';
import { captureOrder } from '../controllers/checkoutController.mjs';

const GETtransaction = async (req, res) => {
    try {
        const customerID = res.locals.customer ? res.locals.customer._id : null;
        const transactions = await Transaction.find({ customer: customerID }).populate('restaurant cart reservation');
        console.log('transactions:', transactions);
        res.render('transaction/transaction', { pageTitle: 'Transaction', transactions });
    } catch (err) {
        console.error(err);
        res.status(500).json('Server error');
    }
}

const cancelReservation = async (req, res) => {
    try {
      const { id } = req.params;
      const transactionObject = await Transaction.findById(id).populate('cart');
  
      if (!transactionObject) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
  
      if (transactionObject.isTransactionComplete) {
        return res.status(400).json({ error: 'Transaction is already completed' });
      }
      console.log('transactionObject.captureId:', transactionObject.captureId);
      // Cancel the order on the payment gateway (e.g., PayPal)
      const { jsonResponse, httpStatusCode } = await captureOrder(transactionObject.captureId, transactionObject, true);
      console.log('httpStatusCode:', httpStatusCode);
      if (httpStatusCode !== 201) {
        return res.status(httpStatusCode).json({ error: jsonResponse });
      }
  
      // Update the transaction status
      transactionObject.isTransactionComplete = true;
      await transactionObject.save();
  
      res.status(200).json({ message: 'Reservation cancelled and refunded successfully' });
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      res.status(500).json({ error: 'Failed to cancel reservation' });
    }
  };


export { GETtransaction, cancelReservation };