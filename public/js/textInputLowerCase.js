//The purpose of this function is to make text from 'Test nAmE' to 'testname'

let textInput = document.getElementById('text');
let lowerTextInput = document.getElementById('lowerText');
const textName = document.querySelector('.hidden-text');
lowerTextInput.value = textName.value.toLowerCase().toLowerCase().replace(/\s/g, '');
console.log('lowerTextInput.value:', lowerTextInput.value);

// Add an event listener to the text input field
textInput.addEventListener('input', function() {
  // Get the value entered in the text input field
  let textValue = textInput.value;

  // Convert the value to lowercase
  const lowerTextValue = textValue.toLowerCase().toLowerCase().replace(/\s/g, '');

  // Set the value of the hidden input field to the lowercase value
  lowerTextInput.value = lowerTextValue;
  console.log('lowerTextInput.value:', lowerTextInput.value);
});