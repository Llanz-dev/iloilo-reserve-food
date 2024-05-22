// db.js
import mongoose from 'mongoose';
const DB_URI = 'mongodb+srv://luyllanzkenneth:kenjie321@cluster0.bkdwdn5.mongodb.net/iloilo-reserve-food?retryWrites=true&w=majority&appName=Cluster0'; // Change this to your MongoDB URI
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
