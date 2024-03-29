const old_restaurant_banner_image = document.getElementById('old_restaurant_banner_image');
console.log(old_restaurant_banner_image.value);

// Get the text input and hidden input elements by their IDs
let nameInput = document.getElementById('name');
let lowerNameInput = document.getElementById('lowername');
const restaurantName = document.querySelector('.restaurant-name');
lowerNameInput.value = restaurantName.value.toLowerCase().toLowerCase().replace(/\s/g, '');

console.log('lowerNameInput.value:', lowerNameInput.value);
// Add an event listener to the text input field
nameInput.addEventListener('input', function() {
  // Get the value entered in the text input field
  let nameValue = nameInput.value;

  // Convert the value to lowercase
  const lowerNameValue = nameValue.toLowerCase().toLowerCase().replace(/\s/g, '');

  // Set the value of the hidden input field to the lowercase value
  lowerNameInput.value = lowerNameValue;
  console.log('lowerNameInput.value:', lowerNameInput.value);
});