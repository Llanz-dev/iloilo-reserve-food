import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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
  let errors = { username: "", fullname: "", age: "", password: "" };
  
  // If the username duplicate
  if (err.code === 11000) {
    errors.username = `${err.keyValue["username"]} username is already exists`;
  }

  // If the passwords do not match
  if (err.message.includes("Passwords do not match")) {
    errors['password'] = 'Passwords do not match';
  }

  if (err.message.includes("Customer validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  console.log(errors);
  return errors;
};

// To format the username and fullname
// Example a customer input username: 'jHoNNy321' format into -> 'jhonny321'
// Example a customer input fullname: 'jHON DoE' format into -> 'Jhon Doe'
const toTitleCase = (getUsername, getFullname) => {
  const usernameAndFullname = { username: "", fullname: "" };
  usernameAndFullname.username = getUsername
    .toLowerCase()
    .split("")
    .map((char) => (char.toUpperCase() === char ? char : char.toLowerCase()))
    .join("");
  usernameAndFullname.fullname = getFullname
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return usernameAndFullname;
};

const fourtyEightHours = 1 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "token secret code", {
    expiresIn: fourtyEightHours,
  });
}

export { hashPassword,comparePassword,handleErrors,toTitleCase, fourtyEightHours, createToken };