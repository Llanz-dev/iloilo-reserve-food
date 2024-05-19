const reservationTimes = document.querySelectorAll('.reservation-time');
reservationTimes.forEach(reservationTime => {
    reservationTime.textContent = formatTime(reservationTime.textContent);
});

// Define formatTime function
function formatTime(time) {
    // Split the time into hours and minutes
    const [hours, minutes] = time.split(':');

    // Convert hours to a number
    const hour = parseInt(hours);

    // Determine whether it's morning or afternoon
    const period = hour >= 12 ? 'pm' : 'am';

    // Convert 24-hour format to 12-hour format
    const formattedHour = hour % 12 || 12;

    // Format the time with "am" or "pm"
    return `${formattedHour}:${minutes} ${period}`;
}