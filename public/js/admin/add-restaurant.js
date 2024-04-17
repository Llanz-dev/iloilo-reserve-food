console.log('Add restaurant');
const restaurantForm = document.getElementById('registration-restaurant-form');
const errorUsername = document.getElementById('error-username');
const errorName = document.getElementById('error-name');
const errorPassword = document.getElementById('error-password');
const errorContainer = document.getElementById('error-container');

// Clear fields
restaurantForm.username.value = '';
restaurantForm.restaurantName.value = '';

restaurantForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = restaurantForm.username.value;
  const restaurantName = restaurantForm.restaurantName.value;
  const lowername = restaurantForm.lowername.value;
  const email = restaurantForm.email.value;
  const phone = restaurantForm.phone.value;
  const address = restaurantForm.address.value;
  const password = restaurantForm.password.value;
  const reEnterPassword = restaurantForm.reEnterPassword.value;
  const imageFile = restaurantForm.image.files[0];
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('username', username);
  formData.append('name', restaurantName);
  formData.append('lowername', lowername);
  formData.append('email', email);
  formData.append('phone', phone);
  formData.append('address', address);
  formData.append('password', password);
  formData.append('reEnterPassword', reEnterPassword);

  try {
    const response = await fetch('/adminux/restaurant-registration', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (data.errors) {
      errorUsername.textContent = data.errors.username;
      errorName.textContent = data.errors.name;
      errorPassword.textContent = data.errors.password;
      errorContainer.style.display = 'block'; // Show the error container
    } else if (data.restaurant) {
      location.assign('/adminux');
    }
  } catch (err) {
    console.log('Add restaurant form error:', err);
  }
});
