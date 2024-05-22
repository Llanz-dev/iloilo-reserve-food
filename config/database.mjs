// db.js
import mongoose from 'mongoose';
const DB_URI = 'mongodb://localhost:27017/iloilo-reserve-food'; // Change this to your MongoDB URI
const PORT = process.env.PORT || 5000;

export const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit the process with a non-zero status code
  }
};
