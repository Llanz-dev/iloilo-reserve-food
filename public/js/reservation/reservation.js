const createReservationButton = document.getElementById('create-reservation-button');
const numPaxInput = document.getElementById('num_pax');

// Get the current date
const today = new Date();
// Format the date to YYYY-MM-DD
const formattedDate = today.toISOString().split('T')[0];
// Set the min attribute of the date input to today's date
document.getElementById('reservation_date').setAttribute('min', formattedDate);

// To restrict the selection of past times in the input field for reservation time
// Get the current time
const currentTime = new Date();
const currentHour = currentTime.getHours();
const currentMinute = currentTime.getMinutes();

// Format the current time as a string
const formattedCurrentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

// Initialize a variable to keep track of form completion
let formCompleted = false;

// Function to check if all fields are filled
const checkFormCompletion = () => {
  const reservationDate = document.getElementById('reservation_date').value;
  const reservationTime = document.getElementById('reservation_time').value;
  const numPax = document.getElementById('num_pax').value;
  
  // Check if all fields have non-empty values
  formCompleted = reservationDate.trim() !== '' && reservationTime.trim() !== '' && numPax.trim() !== '';
  
  // Enable or disable the button based on form completion
  createReservationButton.disabled = !formCompleted;
};

// Function to disable input fields if date is not selected
const disableInputsIfDateNotSelected = () => {
  const reservationDateInput = document.getElementById('reservation_date');
  const reservationTimeInput = document.getElementById('reservation_time');

  // Check if the date input has a value
  const isDateSelected = reservationDateInput.value.trim() !== '';
  const isTimeSelected = reservationTimeInput.value.trim() !== '';

  // Disable or enable the time input based on date selection
  reservationTimeInput.disabled = !isDateSelected;

  // Disable or enable the numPax input based on date selection
  numPaxInput.disabled = !isTimeSelected;
};

// Call the function initially to set the initial state
disableInputsIfDateNotSelected();

// Event listeners for input fields
document.getElementById('reservation_date').addEventListener('input', () => {
    checkFormCompletion();
    disableInputsIfDateNotSelected();

    if (isCurrentSelectedDate()) {
      // Set the minimum value for the time input field
      document.getElementById('reservation_time').min = formattedCurrentTime;
    } else {
      document.getElementById('reservation_time').min = null;
    }
});
  
document.getElementById('reservation_time').addEventListener('input', () => {
    disableInputsIfDateNotSelected();
    checkFormCompletion();
});

// -----------------------------------------------------------------------------------------------------------

const cartAmountSpan = document.querySelector('.total-amount');
const totalAmountCart = parseFloat(cartAmountSpan.textContent);
console.log('totalAmountCart.textContent:', totalAmountCart);

const outOfRange = document.getElementById('out-of-range');
const outOfRangeValue = document.getElementById('out-of-range-value');
outOfRange.style.display = 'none';

// Disable the button initially
createReservationButton.disabled = true;

numPaxInput.addEventListener('input', () => {
    checkFormCompletion();
    const numPax = parseFloat(numPaxInput.value);

    if (numPax <= 0) {
      outOfRange.style.display = 'block';
      outOfRangeValue.textContent = numPax;
      createReservationButton.disabled = true;
    } else {
      outOfRange.style.display = 'none';
      outOfRangeValue.textContent = '';
      createReservationButton.disabled = false;
    }

    if (isNaN(numPax)) return totalAmountCart;
    
    const cartAmount = calculateCartAmount(numPax);

    cartAmountSpan.textContent = putCommas(cartAmount);
});

const calculateCartAmount = (numPax) => {
    const currentCartAmount = parseFloat(totalAmountCart);
    const increment = 15;
    const totalAmountToAdd = Math.ceil(numPax / 2) * increment;
    
    let amount = currentCartAmount + totalAmountToAdd;
    document.getElementById('amount').value = totalAmountToAdd;
    
    return amount;
};

const isCurrentSelectedDate = () => {
    const reservationDate = document.getElementById('reservation_date').value;
    const currentDate = new Date();
    const selectedDate = new Date(reservationDate);

    // Extract year, month, and day from currentDate
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();

    // Extract year, month, and day from selectedDate
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();
    const selectedDay = selectedDate.getDate();

    // Compare year, month, and day
    return currentYear === selectedYear && currentMonth === selectedMonth && currentDay === selectedDay;
};

const putCommas = (amount) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
