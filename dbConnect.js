// dbConnect.js
import mongoose from 'mongoose';

const dbConnect = async () => {
  try {
    await mongoose.connect('mongodb+srv://thebreot:rtntn7Brt@suber.xlla4nj.mongodb.net/?retryWrites=true&w=majority&appName=suber');;
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

export default dbConnect;
