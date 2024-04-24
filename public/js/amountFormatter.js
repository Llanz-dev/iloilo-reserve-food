// Define a function to format the total amount with commas
const formatAmountWithCommas = (amount) => {
    // Split the amount into integer and decimal parts
    const parts = amount.toString().split(".");
    // Insert commas for every three digits from the right side of the integer part
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    // Join the parts back together with the decimal point
    return parts.join(".");
  };
  
// Get the cart amount element
const cartAmount = document.querySelector('.cart-amount');
// Get the total amount value from the span
const totalAmount = parseFloat(cartAmount.textContent);
// Format the total amount with commas
const formattedAmount = formatAmountWithCommas(totalAmount);
// Update the span text content with the formatted amount
cartAmount.textContent = formattedAmount;