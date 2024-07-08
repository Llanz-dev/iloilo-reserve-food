import moment from 'moment-timezone';

const calculateDayDifference = (transactionObject) => {
    // Define the current date and time in 'Asia/Manila'
    const now = moment.tz('Asia/Manila');

    // Extract reservation date and time from transactionObject
    const reservationDateInput = JSON.stringify(transactionObject.reservation.reservation_date).split('T')[0]; // Strip the time component
    const reservationTimeInput = transactionObject.reservation.reservation_time; // Example reservation time from user input
    
    console.log('reservationDateInput:', reservationDateInput);
    console.log('reservationTimeInput:', reservationTimeInput);

    // Combine reservation date and time to create a Moment object
    const reservationDateTime = moment.tz(`${reservationDateInput} ${reservationTimeInput}`, 'YYYY-MM-DD HH:mm', 'Asia/Manila');

    // Debugging: Log the parsed date-time object
    console.log('reservationDateTime:', reservationDateTime.format());

    // Calculate the difference in days between now and the reservation date
    let daysCount = reservationDateTime.diff(now, 'days');

    // Adjust daysCount to account for the partial day
    if (reservationDateTime.isAfter(now, 'day')) {
        daysCount += 1;
    }

    // Update transactionObject based on the calculated daysCount
    transactionObject.isToday = daysCount === 0 && reservationDateTime.isSame(now, 'day');
    transactionObject.isPending = daysCount > 0;

    return daysCount;
};




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

export { calculateDayDifference, timeToMinutes, formatTimeTo12Hour, convertToMinutes };