import Reservation from '../models/reservationModel.mjs';
import Cart from '../models/cartModel.mjs';
import { calculateDayDifference } from '../utils/timeUtils.mjs';
import calculateTotalAmountByPax from '../utils/paxUtils.mjs';
import Voucher from '../models/voucherModel.mjs';
import moment from 'moment-timezone';
import Restaurant from '../models/restaurantModel.mjs';
import NumberPax from '../models/numberPaxModel.mjs';
import { checkReservationDateAndTime } from '../utils/reservationUtils.mjs';

const GETDineInTakeOutReservation = async (req, res) => {
  console.log('---- GETDineInTakeOutReservation ----');
  try {
    const restaurantLowername = req.params.lowername;
    const cartID = req.params.id;
    const restaurant = await Restaurant.findOne({ lowername: restaurantLowername });
    const cart = await Cart.findById(cartID);
    console.log('------- cart:', cart);
    const numberOfItems = cart ? cart.items.length : 0;
    res.render('reservation/dineIn-takeOut', { pageTitle: 'Dine In or Take Out', restaurant, numberOfItems, cart });
  } catch (err) {
    console.log('GETDineInTakeOutReservation:', err);
    res.status(500).json({ error: err.message });
  }
}

const POSTDineInTakeOutReservation = async (req, res) => {
  try {
    const { action } = req.body;
    console.log('action:', action);
    const cartID = req.params.id;    
    const cart = await Cart.findById(cartID).populate('restaurant');
    
    if (action === 'dine-in') {
      // Redirect to dine in URL
      const reservationURL = `/reservation/${cart.restaurant.lowername}/${cart.id}/?dineIn=${true}`;
      res.redirect(reservationURL);
    } else if (action === 'take-out') {
      const reservationURL = `/reservation/${cart.restaurant.lowername}/${cart.id}/?dineIn=${false}`;
      res.redirect(reservationURL);
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err) {
    console.log('POSTDineInTakeOutReservation:', err);
    res.status(500).json({ error: err.message });
  }
};

const GETCreateTakeOutReservation = async (req, res) => {
  try {
    const dineInValue = req.query.dineIn;
    const cartID = req.params.id;
    const cart = await Cart.findById(cartID);

    if (!cart) return res.redirect(`/cart/${cartID}`);
      
    const restaurantID = cart.restaurant;
    const restaurant = await Restaurant.findById(restaurantID);

    const numberOfItems = cart ? cart.items.length : 0;
    
    res.render('reservation/take-out', { pageTitle: 'Reservation', restaurantID, cart, restaurant, numberOfItems, dineInValue });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const GETCreateDineInReservation = async (req, res) => {
  console.log('---- GETCreateDineInReservation ----');
  try {
    const dineInValue = req.query.dineIn;
    const cartID = req.params.id;
    const cart = await Cart.findById(cartID);

    if (!cart) return res.redirect(`/cart/${cartID}`);
      
    const restaurantID = cart.restaurant;
    const restaurant = await Restaurant.findById(restaurantID);
    const numberOfPaxes = await NumberPax.find({ restaurant: restaurantID });

    const numberOfItems = cart ? cart.items.length : 0;
    
    res.render('reservation/reservation', { pageTitle: 'Reservation', restaurantID, cart, restaurant, numberOfItems, dineInValue, numberOfPaxes });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const POSTCreateDineInReservation = async (req, res) => {
  const cartID = req.params.id;
  const cart = await Cart.findById(cartID);
  const restaurantID = cart.restaurant._id;
  const numberOfPaxes = await NumberPax.find({ restaurant: restaurantID });
  const restaurant = await Restaurant.findById(restaurantID);
  const { dineIn } = req.body;
  try {
      const { customer, restaurant, reservation_date, otherOption, reservation_time, table_price, numPaxID, amount, notes } = req.body;
      
      cart.halfAmount = cart.totalAmount / 2;
      
      const restaurantObject = await Restaurant.findById(restaurantID);
  
      // This will throw an error if the reservation date day or time is close.
      // It will prevent the user to reserve on that day and time if resto is close.
      await checkReservationDateAndTime(restaurantObject, reservation_date, reservation_time);

      // Construct URL with reservation data parameters
      const checkoutURL = `/checkout/${restaurantObject.lowername}/${restaurantID}/${cartID}/?restaurantID=${restaurantID}&cartID=${cartID}&numPaxID=${numPaxID}&customer=${customer}&reservation_date=${reservation_date}&reservation_time=${reservation_time}&dineIn=${dineIn}&table_price=${table_price}&amount=${amount}&notes=${notes}&otherOption=${otherOption}`;
      // Redirect to checkout page with reservation data parameters
      res.redirect(checkoutURL);
  } catch (err) {
      console.log('POSTCreateDineInReservation:', err);
      const numberOfItems = cart ? cart.items.length : 0;
      // If there's an error, render the template with the error message
      res.status(500).render('reservation/reservation', { pageTitle: 'Reservation', numberOfPaxes, error: err.message, restaurantID, restaurant, cart, numberOfItems, dineInValue: dineIn });
  }
}

export { GETCreateDineInReservation, POSTCreateDineInReservation, GETDineInTakeOutReservation, POSTDineInTakeOutReservation, GETCreateTakeOutReservation };