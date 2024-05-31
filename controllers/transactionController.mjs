import Voucher from '../models/voucherModel.mjs'
import Transaction from '../models/transactionModel.mjs'
import CustomerQuota from '../models/customerQuotaModel.mjs'; 
import { captureOrder } from '../controllers/checkoutController.mjs';
import { deleteUsedVouchers } from '../utils/restaurantUtils.mjs';
import voucherGenerator from '../utils/voucherUtils.mjs';


const GETtransaction = async (req, res) => {
  try {
    const customerID = res.locals.customer ? res.locals.customer._id : null;

    // Fetch transactions where isTransactionComplete is false for the customer
    const transactions = await Transaction.find({ customer: customerID, isTransactionComplete: false, isCancelled: false })
      .populate({
        path: 'restaurant',
        model: 'Restaurant'
      })
      .populate({
        path: 'cart',
        model: 'Cart',
        populate: {
          path: 'items.product',
          model: 'Product'
        }
      })
      .populate({
        path: 'reservation',
        model: 'Reservation'
      })
      .sort({ createdAt: -1 });

    await deleteUsedVouchers();

    // Get the current date and time in the 'Asia/Manila' timezone
    res.render('transaction/transaction', { pageTitle: 'Transactions', transactions, restaurant: undefined });
  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
};


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

      const customer = res.locals.customer;
      const customerQuota = await CustomerQuota.findOne({ restaurant: transactionObject.restaurant, customer: customer });
      customerQuota.cancelledLimit -= 1;
      await customerQuota.save();
  
      // Update the transaction status
      transactionObject.isCancelled = true;
      transactionObject.isRefunded = true;
      transactionObject.isToday = false;
      transactionObject.isPending = false;
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
      const transactionObject = await Transaction.findById(id).populate('cart restaurant');
  
      if (!transactionObject) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
  
      if (transactionObject.isTransactionComplete) {
        return res.status(400).json({ error: 'Transaction is already completed' });
      }

      const customer = res.locals.customer;
      const customerQuota = await CustomerQuota.findOne({ restaurant: transactionObject.restaurant, customer: customer });
      customerQuota.cancelledLimit -= 1;

      await customerQuota.save();
  
      // Update the transaction status
      transactionObject.isCancelled = true;
      transactionObject.isPending = false;
      transactionObject.isToday = false;
      await transactionObject.save();
  
      res.redirect('/transaction');
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      res.status(500).json({ error: 'Failed to cancel reservation' });
    }
};

export { GETtransaction, cancelReservationRefundable, cancelReservationUnrefundable };
