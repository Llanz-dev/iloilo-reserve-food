import fetch from "node-fetch";
import "dotenv/config";
import path from "path";
import Cart from '../models/cartModel.mjs';
import Reservation from '../models/reservationModel.mjs';
import Transaction from '../models/transactionModel.mjs';
import Paypal from 'paypal-rest-sdk';
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
const base = "https://api-m.sandbox.paypal.com";
import moment from 'moment-timezone';
import { calculateTimeDifference } from "../utils/timeUtils.mjs";

  
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
  
  cart.isHalfPaymentSuccessful = true;
  await cart.save();

  const reservationObject = await Reservation.create({ customer: reservation.customer, restaurant: reservation.restaurantID, cart: reservation.cartID, reservation_date: reservation.reservation_date, reservation_time: reservation.reservation_time, num_pax: reservation.num_pax, notes: reservation.notes });  
  const transaction = await Transaction.create({ customer: cart.customer, restaurant: cart.restaurant, cart: cart, reservation: reservationObject });
  transactionID = transaction._id;

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

      calculateTimeDifference(transactionObject);
      console.log('transactionObject.isWithinAday:', transactionObject.isWithinAday);
      console.log('calculateTimeDifference(transactionObject):', calculateTimeDifference(transactionObject));
      if (httpStatusCode === 201) {
        const captureId = jsonResponse.purchase_units[0].payments.captures[0].id; // Extract captureId from the response
        transactionObject.captureId = captureId; // Store captureId in transactionObject
        await transactionObject.save();
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
  
const createOrderHandler = async (req, res) => {
  try {
    console.log('createOrderHandler req.body:', req.body);
    const cartID = req.body.cart._id;
    const cart = await Cart.findById(cartID);
    const reservation = req.body.reservation;
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

const captureOrderHandler = async (req, res) => {
    try {
        console.log('captureOrderHandler');
        const transactionObject = await Transaction.findById(transactionID).populate('cart reservation');
        console.log('transactionObject:', transactionObject);
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
    const customerID = res.locals.customer ? res.locals.customer._id : null;
    const restaurantID = req.params.restaurantID;
    console.log('customerID:', customerID);
    console.log('restaurantID:', restaurantID);

    const cartID = req.params.cartID;
    const cart = await Cart.findById(cartID);
    const reservation = req.query;
    res.render('checkout/checkout', { pageTitle: 'Checkout with PayPal', cart, reservation });
  } catch (err) {
    console.error("Failed to serve checkout page:", err);
    res.status(500).json({ error: "Failed to serve checkout page." });
  }
};
  
export { createOrderHandler, captureOrderHandler, serveCheckoutPage, captureOrder };
