import Transaction from '../models/transactionModel.mjs'
import { captureOrder } from '../controllers/checkoutController.mjs';

const GETtransaction = async (req, res) => {
  try {
    const customerID = res.locals.customer ? res.locals.customer._id : null;
    
    // Fetch transactions where isTransactionComplete is false for the customer
    const transactions = await Transaction.find({ customer: customerID, isTransactionComplete: false, isCancelled: false }).populate('restaurant cart reservation');
    
    // Get the current date and time in the 'Asia/Manila' timezone
    res.render('transaction/transaction', { pageTitle: 'transactions', transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
}

const cancelReservationRefundable = async (req, res) => {
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
      transactionObject.isCancelled = true;
      transactionObject.isRefunded = true;
      await transactionObject.save();
  
      res.redirect('/transaction');
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      res.status(500).json({ error: 'Failed to cancel reservation' });
    }
};

const cancelReservationUnrefundable = async (req, res) => {
    try {
      const { id } = req.params;
      const transactionObject = await Transaction.findById(id).populate('cart');
  
      if (!transactionObject) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
  
      if (transactionObject.isTransactionComplete) {
        return res.status(400).json({ error: 'Transaction is already completed' });
      }
  
      // Update the transaction status
      transactionObject.isTransactionComplete = true;
      await transactionObject.save();
  
      res.redirect('/transaction');
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      res.status(500).json({ error: 'Failed to cancel reservation' });
    }
};

export { GETtransaction, cancelReservationRefundable, cancelReservationUnrefundable };
