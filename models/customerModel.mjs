// 1. Define a Mongoose schema for the customer collection
import mongoose from "mongoose";
const { Schema } = mongoose;

const customerSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  }
});

// 2. Define a Mongoose model using the schema
export default mongoose.model("Customer", customerSchema);
