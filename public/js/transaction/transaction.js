const totalAmountSpan = document.querySelector('.total-amount');

const putComma = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

totalAmountSpan.textContent = putComma(totalAmountSpan.textContent);

// Function to update current date and time
function updateDateTime() {
  // Get the current date and time
  const currentDate = new Date();
  
  // Format the date and time without seconds
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  const formattedDateTime = currentDate.toLocaleString('en-US', options);
  
  // Update the span element with the formatted date and time
  document.getElementById('current-date-and-time').textContent = formattedDateTime;
}

// Call the function initially to display the current date and time
updateDateTime();

// Update the date and time every minute
setInterval(updateDateTime, 60000); // Update every 60 seconds (1 minute)
