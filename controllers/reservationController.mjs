import Reservation from '../models/reservationModel.mjs';
import Cart from '../models/cartModel.mjs';
import { calculateTimeDifference } from '../utils/timeUtils.mjs';
import calculateTotalAmountByPax from '../utils/paxUtils.mjs';
import Voucher from '../models/voucherModel.mjs';

const GETCreateReservation = async (req, res) => {
  try {
    const cartID = req.params.id;
    const cart = await Cart.findById(cartID).populate('restaurant');

    if (!cart) return res.redirect(`/cart/${cartID}`);
      
    const restaurantID = cart.restaurant._id;
    const restaurant = cart.restaurant;
    const numberOfItems = cart ? cart.items.length : 0;
    
    res.render('reservation/reservation', { pageTitle: 'Reservation', restaurantID, cart, restaurant, numberOfItems });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const POSTCreateReservation = async (req, res) => {
  const cartID = req.params.id;
  const cart = await Cart.findById(cartID);
  const restaurantID = cart.restaurant._id;

  try {
    const { customer, restaurant, reservation_date, reservation_time, num_pax, amount, notes } = req.body;
  
    console.log('req.body:', req.body);
    console.log('num_pax:', num_pax);

    if (num_pax <= 0 || num_pax > 17) {
      throw Error(`Number of pax "${num_pax}" is invalid!`);
    }

    calculateTotalAmountByPax(num_pax, cart);

    console.log('total:', cart.totalAmount);
    cart.halfAmount = cart.totalAmount / 2;
    // await cart.save();

    // Construct URL with reservation data parameters
    const redirectURL = `/checkout/${restaurantID}/${cartID}/?restaurantID=${restaurantID}&cartID=${cartID}&customer=${customer}&reservation_date=${reservation_date}&reservation_time=${reservation_time}&num_pax=${num_pax}&amount=${amount}&notes=${notes}`;
    
    // Redirect to checkout page with reservation data parameters
    res.redirect(redirectURL);
  } catch (err) {
    console.log('POSTCreateReservation:', err);
    // If there's an error, render the template with the error message
    res.status(500).render('reservation/reservation', { pageTitle: 'Reservation', error: err.message, restaurantID, cart });
  }
}


export { GETCreateReservation, POSTCreateReservation };