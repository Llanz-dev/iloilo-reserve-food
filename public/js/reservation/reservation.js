const createReservationButton = document.getElementById('create-reservation-button');
const numPaxInput = document.getElementById('num_pax');


// To restrict the date input to allow only today and future dates
// Get the current date
const today = new Date();
// Format the date to YYYY-MM-DD
const formattedDate = today.toISOString().split('T')[0];
// Set the min attribute of the date input to today's date
document.getElementById('reservation_date').setAttribute('min', formattedDate);

// -----------------------------------------------------------------------------------------------------------

// To restrict the selection of past times in the input field for reservation time
// Get the current time
const currentTime = new Date();
const currentHour = currentTime.getHours();
const currentMinute = currentTime.getMinutes();

// Format the current time as a string
const formattedCurrentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

// Set the minimum value for the time input field
document.getElementById('reservation_time').min = formattedCurrentTime;

// -----------------------------------------------------------------------------------------------------------

// Initialize a variable to keep track of form completion
let formCompleted = false;

// Function to check if all fields are filled
const checkFormCompletion = () => {
  const reservationDate = document.getElementById('reservation_date').value;
  const reservationTime = document.getElementById('reservation_time').value;
  const numPax = document.getElementById('num_pax').value;

  // Check if all fields have non-empty values
  formCompleted = reservationDate.trim() !== '' && reservationTime.trim() !== '' && numPax.trim() !== '';
  console.log('reservationDate:', reservationDate);
  console.log('reservationTime:', reservationTime);
  console.log('numPax:', numPax);
  console.log('formCompleted:', formCompleted);
};

// Event listeners for input fields
document.getElementById('reservation_date').oninput = () => {
    checkFormCompletion();
};
  
document.getElementById('reservation_time').oninput = () => {
    checkFormCompletion();
};

numPaxInput.oninput = () => {
    checkFormCompletion();
};
  
// Function to disable/enable the button based on form completion
const toggleButtonDisabledState = () => {
    createReservationButton.disabled = !formCompleted;
};
  
// Call the function initially to set the initial state
toggleButtonDisabledState();

// -----------------------------------------------------------------------------------------------------------

const cartAmountSpan = document.getElementById('cart-amount');
const totalAmountCart = parseInt(cartAmountSpan.textContent);

const outOfRange = document.getElementById('out-of-range');
const outOfRangeValue = document.getElementById('out-of-range-value');
outOfRange.style.display = 'none';

// Select the button element
// Disable the button
createReservationButton.disabled = true;

numPaxInput.oninput = () => {
    const numPax = parseInt(numPaxInput.value);
    console.log('totalAmountCart:', totalAmountCart);
    console.log('numPax:', numPax);

    if (isInRange(numPax)) {
        outOfRange.style.display = 'block';  
        outOfRangeValue.textContent = numPax;  
        createReservationButton.disabled = true;
    } else {
        outOfRange.style.display = 'none';    
        createReservationButton.disabled = false;
    }

    if (isNaN(numPax) || isInRange(numPax)) return cartAmountSpan.textContent = totalAmountCart;
    
    const cartAmount = calculateCartAmount(numPax);
    cartAmountSpan.textContent = cartAmount;
}

const isInRange = (num_pax) => {
    if (num_pax < 1 || num_pax > 17) return true;
    
    return false;
}

const calculateCartAmount = (numPax) => {
    const currentCartAmount = parseInt(cartAmountSpan.textContent);
    let amount = currentCartAmount;
    if (numPax <= 2) {
        amount += 15;
    } else if (numPax >= 3 && numPax <= 5) {
        amount += 50;
    } else if (numPax >= 6 && numPax <= 9) {
        amount += 80;
    } else if (numPax >= 10 && numPax <= 13) {
        amount += 110;
    } else {
        amount += 140;
    }
    return amount;
};
