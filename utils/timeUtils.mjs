import moment from 'moment-timezone';

const calculateDayDifference = (transactionObject) => {
    // Define the current date in 'Asia/Manila'
    const now = moment.tz('Asia/Manila');

    // Extract reservation date from transactionObject
    const reservationDateInput = transactionObject.reservation.reservation_date; // Example reservation date from user input

    // Convert reservation date to a Moment object
    const reservationDate = moment(reservationDateInput);

    // Calculate the difference in days between now and the reservation date
    let daysCount = reservationDate.diff(now, 'days');

    // Adjust daysCount to account for the partial day
    if (reservationDate.isAfter(now, 'day')) {
        daysCount += 1;
    }

    console.log('daysCount:', daysCount); 

    // Update transactionObject based on the calculated daysCount
    return daysCount;
}

export { calculateDayDifference };