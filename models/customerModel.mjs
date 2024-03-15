import mongoose from "mongoose";
const { Schema } = mongoose;

const minimumLengthMessage = (field, minValue) => {
  return `Minimum ${field} length is ${minValue} characters`;
};

const maximumLengthMessage = (field, maxValue) => {
  return `Maximum ${field} length is ${maxValue} characters`;
};

const customerSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: [5, minimumLengthMessage('username', 5)],
    maxLength: [10, maximumLengthMessage('username', 10)]
  },
  fullname: {
    type: String,
    required: true,
    minLength: [5, minimumLengthMessage('fullname', 5)],
    maxLength: [30, maximumLengthMessage('fullname', 30)]
  },
  age: {
    type: Number,
    required: true,
    min: [15, '15 is the age limit']
  },
  password: {
    type: String,
    required: true,
  }
});

export default mongoose.model("Customer", customerSchema);
