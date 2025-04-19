import mongoose from 'mongoose';
import { initDbStaticEntities } from './init';

export const connectToDatabase = async () => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    throw new Error('MONGO_URI not provided');
  }

  try {
    await mongoose.connect(MONGO_URI);

    await initDbStaticEntities();
    console.log('🟢 Connected to MongoDB');
  } catch (error) {
    console.error('🔴 MongoDB connection error:', error);
    process.exit(1);
  }
};