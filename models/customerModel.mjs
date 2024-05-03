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
  dateOfBirth: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        // Custom validation logic to ensure the date of birth is not in the future
        return value < new Date();
      },
      message: 'Date of birth cannot be in the future'
    }
  },
  password: {
    type: String,
    required: true,
  }
});

export default mongoose.model("Customer", customerSchema);
