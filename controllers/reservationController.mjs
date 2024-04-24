import Reservation from '../models/reservationModel.mjs';
import Cart from '../models/cartModel.mjs';

const GETCreateReservation = async (req, res) => {
  try {
    const cartID = req.params.id;
    console.log('cartID:', cartID);

    const cart = await Cart.findById(cartID).populate('restaurant');
    console.log('cart:', cart);
    if (!cart) {
      return res.redirect(`/cart/${cartID}`);
    }
    const restaurantID = cart.restaurant._id;
    res.render('reservation/reservation', { pageTitle: 'Reservation', restaurantID, cart });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const POSTCreateReservation = async (req, res) => {
  const cartID = req.params.id;
  const cart = await Cart.findById(cartID);
  const restaurantID = cart.restaurant._id;

  try {
    const { customer, restaurant, reservation_date, reservation_time, num_pax, notes } = req.body;
  
    console.log('req.body:', req.body);
    console.log('num_pax:', num_pax);

    if (num_pax <= 0 || num_pax > 17) {
      throw Error(`Number of pax "${num_pax}" is invalid!`);
    }

    // 1 to 2 = 15
    if (num_pax <= 2) {
      console.log('1 to 2 = 15');
      cart.totalAmount += 15;
      // 3 to 5 = 50
    } else if (num_pax >= 3 && num_pax <= 5) {
      console.log('3 to 5 = 50');
      cart.totalAmount += 50;
      // 6 to 9 = 80
    } else if (num_pax >= 6 && num_pax <= 9) {
      console.log('6 to 9 = 80');
      cart.totalAmount += 80;
      // 10 to 13 = 110
    } else if (num_pax >= 10 && num_pax <= 13) {
      console.log('10 to 13 = 110');
      cart.totalAmount += 110;
      // 14 to 17 = 140
    } else {
      console.log('14 to 17 = 140');
      cart.totalAmount += 140;
    } 

    console.log('total:', cart.totalAmount);
    await cart.save();

    const reservation = await Reservation.create({ customer, restaurant, cart, reservation_date, reservation_time, num_pax, notes });
    console.log('successfully reserve:', reservation);
    res.redirect(`/checkout/${ reservation.restaurant._id }/${ cartID }`);
  } catch (err) {
    console.log('POSTCreateReservation:', err);
    // If there's an error, render the template with the error message
    res.status(500).render('reservation/reservation', { pageTitle: 'Reservation', error: err.message, restaurantID, cart });
  }
}

export { GETCreateReservation, POSTCreateReservation };