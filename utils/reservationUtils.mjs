function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

function formatTimeTo12Hour(time) {
    const [hours, minutes] = time.split(':').map(Number);
    let period = 'AM';
    let formattedHours = hours;
    
    if (hours >= 12) {
        period = 'PM';
        if (hours > 12) {
            formattedHours = hours - 12;
        }
    } else if (hours === 0) {
        formattedHours = 12;
    }

    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function convertToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

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

export { timeToMinutes, formatTimeTo12Hour, convertToMinutes, checkReservationDateAndTime };