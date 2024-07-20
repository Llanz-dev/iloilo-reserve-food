import Reservation from '../models/reservationModel.mjs';
import NumberPax from '../models/numberPaxModel.mjs';
import moment from "moment-timezone";

const checkReservationDateAndTime = async (restaurantObject, reservation_date, reservation_time) => {    
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    // Parse the reservation date and time with the Philippines timezone
    const timezone = 'Asia/Manila';
    const currentDate = moment.tz(reservation_date, timezone);
    const currentDayIndex = currentDate.day(); // 0 (Sunday) to 6 (Saturday)
    const targetDay = days[currentDayIndex];

    const dayInfo = restaurantObject.openingHours.find(dayInfo => dayInfo.day === targetDay);
    if (!dayInfo || !dayInfo.isOpen) {
        throw new Error(`Reservation day ${targetDay} is closed. Please choose another day.`);
    }
    
    const reservationDateTime = moment.tz(`${reservation_date} ${reservation_time}`, 'YYYY-MM-DD HH:mm', timezone);
    const openTime = moment.tz(`${reservation_date} ${dayInfo.open}`, 'YYYY-MM-DD HH:mm', timezone);
    const closeTime = moment.tz(`${reservation_date} ${dayInfo.close}`, 'YYYY-MM-DD HH:mm', timezone);
    
    if (!reservationDateTime.isBetween(openTime, closeTime, null, '[)')) {      
      throw new Error(`Reservation time ${reservationDateTime.format('h:mm A')} is not within operating hours because the restaurant is open from ${openTime.format('h:mm A')} to ${closeTime.format('h:mm A')}`);
    }
};

const freeUpTable = async (transactionObject) => {
  console.log('freeUpTable:', transactionObject);
  const cartID = transactionObject.cart._id;
  const reservationObject = await Reservation.findOne({ cart: cartID }).populate('numberPax');
  const numberPaxID = await reservationObject.numberPax._id;
  await NumberPax.updateOne({ _id: numberPaxID }, { isOccupied: false });
}

export { checkReservationDateAndTime, freeUpTable };