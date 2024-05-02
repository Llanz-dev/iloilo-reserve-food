const reservation_date = document.querySelector('.reservation-date');

// Parse the reservation date string into a Date object
let reservationDate = new Date(reservation_date.textContent);

// Get the current date
let currentDate = new Date();

// Convert to string
reservationDate = reservationDate.toDateString();
currentDate = currentDate.toDateString();

// Compare reservation date with current date
if (reservationDate < currentDate) {
    console.log('Reservation date is in the past');
} else if (reservationDate === currentDate) {
    console.log('Reservation date is today');
} else {
    console.log('Reservation date is in the future');
}
