import Reservation from '../models/reservationModel.mjs';
import Cart from '../models/cartModel.mjs';

const GETCreateReservation = async (req, res) => {
  try {
    const cartID = req.params.id;
    const cart = await Cart.findById(cartID).populate('restaurant');
    const restaurantID = cart.restaurant._id;
    res.render('reservation/reservation', { pageTitle: 'Reservation', restaurantID, cart });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const POSTCreateReservation = async (req, res) => {
  try {
    const cartID = req.params.id;
    const { customer, restaurant, reservation_date, reservation_time, num_pax, notes } = req.body;
    const cart = await Cart.findById(cartID);
    console.log('req.body:', req.body);
    console.log('num_pax:', num_pax);

    if (num_pax <= 0 || num_pax > 17) {
      res.status(500).json(`num_pax: ${num_pax} is invalid!`);      
    }

    // 1 to 2 = 15
    if (num_pax <= 2) {
      console.log('1 to 2 = 15');
    // 3 to 5 = 50
    cart.amount += 15;
    } else if (num_pax >= 3 && num_pax <= 5) {
      console.log('3 to 5 = 50');
    // 6 to 9 = 80
    cart.amount += 50;
    } else if (num_pax >= 6 && num_pax <= 9) {
      console.log('6 to 9 = 80');
    // 10 to 13 = 110
    cart.amount += 80;
    } else if (num_pax >= 10 && num_pax <= 13) {
      console.log('10 to 13 = 110');
      // 14 to 17 = 140
      cart.amount += 110;
    } else {
      console.log('14 to 17 = 140');
      cart.amount += 140;
    } 

    console.log('total:', cart.amount);
    await cart.save();

    const reservation = await Reservation.create({ customer, restaurant, reservation_date, reservation_time, num_pax, notes });
    res.redirect(`/payment/${ reservation._id }`);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export { GETCreateReservation, POSTCreateReservation };