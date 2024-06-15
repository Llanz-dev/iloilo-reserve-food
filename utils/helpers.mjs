import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import moment from "moment-timezone";

const hashPassword = async (password) => {
  const saltRounds = 10;
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
  } catch (err) {
    throw new Error(err);
  }
};

const comparePassword = async (plain, hash) => {
  try {
    return await bcrypt.compare(plain, hash);
  } catch (err) {
    throw err;
  }
};

const handleErrors = (err) => {
  console.log('err.message:', err.message);
  let errors = { username: '', fullname: '', age: '', password: '' };

  if (err.message === 'Incorrect username') {
    errors.username = 'Username is incorrect. Please try again.';
  }

  if (err.message === 'Incorrect password') {
    errors.password = 'Password is incorrect. Please try again.';
  }

  // If the username duplicate
  if (err.code === 11000) {
    errors.username = `${err.keyValue["username"]} username is already exists`;
  }

  // If the passwords do not match
  if (err.message.includes("Passwords do not match")) {
    errors['password'] = 'Your passwords do not match. Please re-type the password.';
  }

  if (err.message.includes("Customer validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

// To format the text
// Example a text value is 'jHoNNy321' format into -> 'jhonny321'
const toTitleCase = (textValue) => {
  return textValue.toLowerCase().split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
};

// Example a customer input fullname: 'jHON DoE' format into -> 'Jhon Doe'
const toSmallerCase = (textValue) => {
  return textValue.toLowerCase().split("").map((char) => (char.toUpperCase() === char ? char : char.toLowerCase())).join("");
}

// To format a text to all lowercase
// Example a customer input username: 'The Hungry Hound' format into -> 'thehungryhound'
const lowerCase = (field) => {
  return field.toLowerCase().replace(/\s/g, '');
}

const fourtyEightHours = 1 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'token secret code', {
    expiresIn: fourtyEightHours,
  });
}

const hasProduct = async () => {
  const restaurantID = req.restaurantID;
  const categories = await Category.find({restaurant: restaurantID});
  return categories.length; 
}

const isQueryEmpty = (objectName) => {
  return Object.keys(objectName).length === 0;
}

const isRestaurantOpen = (foundDay, currentTime) => {
  while (foundDay.open && foundDay.close) {
      console.log('foundDay.close:', foundDay.close);
      console.log('currentTime:', currentTime);
      console.log('foundDay.close === currentTime:', foundDay.close === currentTime);
      if (foundDay.open === currentTime || foundDay.close === currentTime) {
          return true;
      } 
      return foundDay.open <= currentTime && foundDay.close >= currentTime;
  }
  return false;
}

export { hashPassword, comparePassword, handleErrors, toTitleCase, toSmallerCase, fourtyEightHours, createToken, lowerCase, hasProduct, isQueryEmpty, isRestaurantOpen };
