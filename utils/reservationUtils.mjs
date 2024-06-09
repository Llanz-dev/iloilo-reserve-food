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
    const currentDate = new Date(reservation_date);
    const currentDayIndex = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
    const targetDay = days[currentDayIndex];

    const dayInfo = restaurantObject.openingHours.find(dayInfo => dayInfo.day === targetDay);
    if (!dayInfo || !dayInfo.isOpen) {
        throw new Error(`Reservation day ${targetDay} is closed. Please choose other day`);
    }
    const reservationTimeInMinutes = convertToMinutes(reservation_time); 
    const openTimeInMinutes = convertToMinutes(dayInfo.open); 
    const closeTimeInMinutes = convertToMinutes(dayInfo.close);
    const isWithinOperatingHours = reservationTimeInMinutes >= openTimeInMinutes && reservationTimeInMinutes <= closeTimeInMinutes;
    if (!isWithinOperatingHours) {      
      throw new Error(`Reservation time ${formatTimeTo12Hour(reservation_time)} is not within operating hours because the restaurant open from ${formatTimeTo12Hour(dayInfo.open)} to ${formatTimeTo12Hour(dayInfo.close)}`)
    }
}

export { timeToMinutes, formatTimeTo12Hour, convertToMinutes, checkReservationDateAndTime };