console.log('Register page');
const registerForm = document.getElementById('register-form');
const errorUsername = document.getElementById('error-username');
const errorFullname = document.getElementById('error-fullname');
const errorDateOfBirth = document.getElementById('error-dateOfBirth');
const errorPassword = document.getElementById('error-password');

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = registerForm.username.value;
  const fullname = registerForm.fullname.value;
  const dateOfBirth = registerForm.dateOfBirth.value;
  const password = registerForm.password.value;
  const reEnterPassword = registerForm.reEnterPassword.value;

  try {
    const res = await fetch('/register', {
      method: 'POST',
      body: JSON.stringify({ username, fullname, dateOfBirth, password, reEnterPassword }),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (data.errors) {
      errorUsername.textContent = data.errors.username;
      errorFullname.textContent = data.errors.fullname;
      errorDateOfBirth.textContent = data.errors.dateOfBirth;
      errorPassword.textContent = data.errors.password;
    }

    if (data.customer) {
      location.assign('/');
    }
  } catch (err) {
    console.log('register form error:', err);
  }
});
