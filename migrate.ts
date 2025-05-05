import mongoose from 'mongoose';
import { encryptTransactionsMigration } from './src/migrations/2025-05-encrypt-transactions';
import dotenv from 'dotenv';
dotenv.config();

const runMigrations = async () => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error('MONGO_URI environment variable is required');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await encryptTransactionsMigration();

    await mongoose.disconnect();
    console.log('Migration finished successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();