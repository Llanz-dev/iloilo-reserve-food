import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import fs from 'fs-extra';
import path from 'path';

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

// To format the username and fullname
// Example a customer input username: 'jHoNNy321' format into -> 'jhonny321'
// Example a customer input fullname: 'jHON DoE' format into -> 'Jhon Doe'
const toTitleCase = (getUsername, getFullname) => {
  const usernameAndFullname = { username: "", fullname: "" };
  usernameAndFullname.username = getUsername.toLowerCase().split("").map((char) => (char.toUpperCase() === char ? char : char.toLowerCase())).join("");
  usernameAndFullname.fullname = getFullname.toLowerCase().split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  return usernameAndFullname;
};

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

const renameAndDeleteOldFolder = async (oldPath, newPath) => {
  // Get the parent directory of the old path
  // Example "public/images/restaurant/<restaurantname>"
  const parentDir = path.dirname(oldPath);

  try {
    // Rename the existing directory to the new path
    await fs.move(oldPath, newPath, { overwrite: true });

    // Remove the old parent directory
    await fs.remove(parentDir);

    console.log('Folder renamed, and old folder deleted successfully.');
  } catch (err) {
    console.error('Error renaming folder or deleting old folder:', err);
  }
};


export { hashPassword, comparePassword, handleErrors, toTitleCase, fourtyEightHours, createToken, lowerCase, renameAndDeleteOldFolder };
