import fetch from "node-fetch";
import "dotenv/config";
import path from "path";
import Cart from '../models/cartModel.mjs';
  
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
const base = "https://api-m.sandbox.paypal.com";
  
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
const createOrder = async (cart) => {
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
  
  return handleResponse(response);
};

/**
* Capture payment for the created order to complete the transaction.
*/
const captureOrder = async (orderID) => {
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders/${orderID}/capture`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
      // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
      // "PayPal-Mock-Response": '{"mock_application_codes": "INSTRUMENT_DECLINED"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "TRANSACTION_REFUSED"}'
      // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
    },
  });
  
  return handleResponse(response);
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
    const cartID = req.body.cart._id;
    console.log('req.body:', req.body);
    console.log('cartID:', cartID);
    const cart = await Cart.findById(cartID);
    console.log('createOrderHandler cart:', cart);
    if (!cart) {
      throw new Error("Cart not found");
    }
    const { jsonResponse, httpStatusCode } = await createOrder(cart);
    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
};

const captureOrderHandler = async (req, res) => {
    try {
        const { orderID } = req.params;
        console.log('orderID:', orderID);
        const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
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
    const cartID = req.params.cartID;
    const cart = await Cart.findById(cartID);
    res.render('checkout/checkout', { pageTitle: 'Checkout with PayPal', cart });
  } catch (err) {
    console.error("Failed to serve checkout page:", err);
    res.status(500).json({ error: "Failed to serve checkout page." });
  }
};
  
export { createOrderHandler, captureOrderHandler, serveCheckoutPage };
