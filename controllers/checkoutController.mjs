import fetch from "node-fetch";
import "dotenv/config";
import Cart from '../models/cartModel.mjs';
import Reservation from '../models/reservationModel.mjs';
import Transaction from '../models/transactionModel.mjs';
import Restaurant from '../models/restaurantModel.mjs';
import CustomerQuota from '../models/customerQuotaModel.mjs';
import Voucher from '../models/voucherModel.mjs';
import NumberPax from '../models/numberPaxModel.mjs';
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
const base = "https://api-m.sandbox.paypal.com";
import moment from 'moment-timezone';
import { calculateDayDifference } from "../utils/timeUtils.mjs";

  
/**
* Generate an OAuth 2.0 access token for authenticating with PayPal REST APIs.
*/
const generateAccessToken = async () => {
  try {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error("MISSING_API_CREDENTIALS");
    }
    const auth = Buffer.from(
      PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET,
    ).toString("base64");
    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Failed to generate Access Token:", error);
  }
};
  
/**
 * Create an order to start the transaction.
 */
let transactionID = undefined;
const createOrder = async (cart, reservation) => {
    // use the cart information passed from the front-end to calculate the purchase unit details
    console.log(
      "shopping cart information passed from the frontend createOrder() callback:",
      cart,
    );
    
    console.log('cart.halfAmount:', cart.halfAmount);
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;
    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "PHP",
            value: cart.halfAmount.toFixed(2), // Use the actual cart amount
          },
        },
      ],
    };
    
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      method: "POST",
      body: JSON.stringify(payload),
    });

    return handleResponse(response);
};

/**
 * Capture payment for the created order to complete the transaction.
*/
const captureOrder = async (orderID, transactionObject, isCancellation) => {
  if (isCancellation) {
      // Refund the order
      const accessToken = await generateAccessToken();
      const url = `${base}/v2/payments/captures/${orderID}/refund`;
      const payload = {
        amount: {
          value: transactionObject.cart.halfAmount.toFixed(2),
          currency_code: 'PHP',
        },
      };

      console.log('transactionObject.cart.halfAmount.toFixed(2):', transactionObject.cart.halfAmount.toFixed(2));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log('responseData:', responseData);
      console.log('response.ok:', response.ok);
      console.log('response.status:', response.status);

      const httpStatusCode = response.status; // Assign the HTTP status code

      if (!response.ok) {
        if (response.status === 404 && responseData.details && responseData.details[0].issue === 'CAPTURE_NOT_FOUND') {
          throw new Error('Capture not found');
        } else if (response.status === 400 && responseData.details && responseData.details[0].issue === 'CAPTURE_FULLY_REFUNDED') {
          console.log('Capture has already been fully refunded');
          transactionObject.isRefunded = true;
          await transactionObject.save();
          return { success: false, responseData };
        } else {
          throw new Error(responseData.error || 'Failed to refund payment');
        }
      }

      transactionObject.isRefunded = true;
      await transactionObject.save();

      return { success: true, responseData, httpStatusCode }; // Return httpStatusCode
  } else {
      // Capture the order
      const accessToken = await generateAccessToken();
      const url = `${base}/v2/checkout/orders/${orderID}/capture`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const jsonResponse = await response.json();
      const httpStatusCode = response.status; // Assign the HTTP status code

      calculateDayDifference(transactionObject);
      if (httpStatusCode === 201) {
        const captureId = jsonResponse.purchase_units[0].payments.captures[0].id; // Extract captureId from the response
        transactionObject.captureId = captureId; // Store captureId in transactionObject
        const voucher = await Voucher.findOneAndUpdate({$and: [{ customer: transactionObject.customer }, { restaurant: transactionObject.restaurant }]}, { isUsed: true });
        console.log('voucher:', voucher);
        await transactionObject.save();
      } else {
        await Transaction.findByIdAndDelete();
      }

      return { jsonResponse, httpStatusCode };
  }
};
 
async function handleResponse(response) {
  try {
    const jsonResponse = await response.json();
    return {
      jsonResponse,
      httpStatusCode: response.status,
    };
  } catch (err) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
}
  
let reservationQuery = undefined;
let getCartID = undefined;
const createOrderHandler = async (req, res) => {
  try {
    const cartID = req.body.cart._id;
    const cart = await Cart.findById(cartID);
    const reservation = req.body.reservation;
  
    cart.totalAmount += Number(reservation.table_price);
    cart.halfAmount = (cart.totalAmount - cart.voucherAmount) / 2;

    if (!cart) {
      throw new Error("Cart not found");
    }

    const { jsonResponse, httpStatusCode } = await createOrder(cart, reservation);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
};

// This function is where I do save all the data and finalized things.
const captureOrderHandler = async (req, res) => {
  try {
    console.log('getCartID:', getCartID);
    console.log('---------- captureOrderHandler Finish ----------');
    const cartID = req.params.cartID;
    const cart = await Cart.findById(getCartID).populate('customer restaurant');
    console.log('reservationQuery:', reservationQuery);
    let reservationObject = undefined;
    if (reservationQuery.dineIn && !reservationQuery.otherOption) {
      console.log('hello');
      // Put the customer to NumberPax customer field to indicate that this table has already been taken.
      const numPax = await NumberPax.findByIdAndUpdate(reservationQuery.numPaxID, { isOccupied: true });
      console.log('numPax:', numPax);
      reservationObject = await Reservation.create({ customer: reservationQuery.customer, restaurant: reservationQuery.restaurantID, cart: reservationQuery.cartID, numberPax: reservationQuery.numPaxID, reservation_date: reservationQuery.reservation_date, reservation_time: reservationQuery.reservation_time, amount: Number(reservationQuery.table_price), dineIn: reservationQuery.dineIn, notes: reservationQuery.notes });  
    } else if (reservationQuery.dineIn && reservationQuery.otherOption) {
      console.log('word');
      reservationObject = await Reservation.create({ customer: reservationQuery.customer, restaurant: reservationQuery.restaurantID, cart: reservationQuery.cartID, reservation_date: reservationQuery.reservation_date, reservation_time: reservationQuery.reservation_time, other: reservationQuery.otherOption, amount: 0, dineIn: reservationQuery.dineIn, notes: reservationQuery.notes });    
    } else {
      console.log('zzzzzzz');
      reservationObject = await Reservation.create({ customer: reservationQuery.customer, restaurant: reservationQuery.restaurantID, cart: reservationQuery.cartID, reservation_date: reservationQuery.reservation_date, reservation_time: reservationQuery.reservation_time, amount: 0, dineIn: reservationQuery.dineIn, notes: reservationQuery.notes });  
    }

    cart.totalAmount = (cart.subTotal + cart.reservationAmount) - cart.voucherAmount;
    cart.halfAmount = cart.totalAmount / 2;
    cart.isHalfPaymentSuccessful = true;
    console.log('carrrrrrrrrt:', cart);    
    await cart.save();

    // Create transaction model.
    let transaction = undefined;
    if ((reservationQuery.dineIn && !reservationQuery.otherOption) || !reservationQuery.dineIn) {
      transaction = await Transaction.create({ customer: cart.customer, restaurant: cart.restaurant, cart: cart, reservation: reservationObject });    
    } else {
      transaction = await Transaction.create({ customer: cart.customer, restaurant: cart.restaurant, cart: cart, reservation: reservationObject, acceptOrNot: 'Pending' });    
    }
    
    const transactionObject = await Transaction.findById(transaction._id).populate('cart reservation');
    const customerQuota = await CustomerQuota.findOne({ customer: cart.customer, restaurant: cart.restaurant });
    
    if (!customerQuota) {
      const customerQuotaCreated = await CustomerQuota.create({ customer: cart.customer, restaurant: cart.restaurant });
      console.log('Customer Quota Created:', customerQuotaCreated);
    }

    const { orderID } = req.params;
    const { jsonResponse, httpStatusCode } = await captureOrder(orderID, transactionObject, false);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
      console.error("Failed to capture order:", error);
      res.status(500).json({ error: "Failed to capture order." });
  }
};

const serveCheckoutPage = async (req, res) => {
  try {
      // Get the customer ID
      const customerID = res.locals.customer ? res.locals.customer._id : null;

      // Get the restaurant ID
      const restaurantID = req.params.restaurantID;

      // Get the reservation data from the previous customer reservation input page
      const reservation = req.query;
      reservationQuery = reservation;
      
      reservationQuery.otherOption = Number(reservationQuery.otherOption);

      console.log('reservationQueryyy:', reservationQuery);


      // Convert the reservationQuery.dineIn true string value to boolean
      reservationQuery.dineIn = reservation.dineIn === 'true';

      if (reservationQuery.dineIn === false) {
        reservationQuery.table_price = 0;
      }

      // Get the restaurant
      const restaurant = await Restaurant.findById(restaurantID);

      // Get the cart ID from URL
      const cartID = req.params.cartID;
      getCartID = cartID;

      // Get the cart to display the items and fetch the amount information
      const cart = await Cart.findById(cartID).populate('items.product');
      
      if (reservationQuery.dineIn) {
        cart.reservationAmount = Number(reservation.table_price);
      } else {
        cart.reservationAmount = 0;
      }

      await cart.save();
  
      if (cart.voucherAmount !== 0 || reservationQuery.dineIn) {
        cart.totalAmount += Number(reservation.table_price);
        cart.halfAmount = cart.totalAmount / 2;
        reservationQuery.amount = cart.totalAmount;
      }

      cart.halfAmount = (cart.totalAmount - cart.voucherAmount) / 2;
      cart.totalAmount -= cart.voucherAmount;

      console.log('carrrrrrt:', cart);

      const numberOfItems = cart ? cart.items.length : 0;
      res.render('checkout/checkout', { pageTitle: 'Checkout', cart, reservation, restaurant, numberOfItems });
  } catch (err) {
      console.error("Failed to serve checkout page:", err);
      res.status(500).json({ error: "Failed to serve checkout page." });
  }
};
  
export { createOrderHandler, captureOrderHandler, serveCheckoutPage, captureOrder };
