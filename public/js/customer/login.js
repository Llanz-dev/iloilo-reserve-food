console.log('Login page');
const loginForm = document.getElementById('login-form');
const errorUsername = document.getElementById('error-username');
const errorPassword = document.getElementById('error-password');


loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = loginForm.username.value;
  const password = loginForm.password.value;

  try {
    const res = await fetch('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (data.errors) {
      errorUsername.textContent = data.errors.username;
      errorPassword.textContent = data.errors.password;
    }

    if (data.customer) {
      location.assign('/');
    }
  } catch (err) {
    console.log('login form error:', err);
  }
});
