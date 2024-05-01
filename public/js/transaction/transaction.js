const totalAmountSpan = document.querySelector('.total-amount');

const putComma = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

totalAmountSpan.textContent = putComma(totalAmountSpan.textContent);

const reservationTime = document.querySelector('.reservation-time');
reservationTime.textContent = formatTime(reservationTime.textContent);

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

 // Function to update current date and time
 function updateDateTime() {
    // Get the current date and time
    const currentDate = new Date();
    
    // Format the date and time
    const formattedDateTime = currentDate.toLocaleString();
    
    // Update the span element with the formatted date and time
    document.getElementById('current-date-and-time').textContent = formattedDateTime;
  }

  // Call the function initially to display the current date and time
  updateDateTime();

  // Update the date and time every second
  setInterval(updateDateTime, 1000);