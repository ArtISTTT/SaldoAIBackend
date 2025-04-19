import { startServer } from './app';
import { connectToDatabase } from './db';

const bootstrap = async () => {
  await connectToDatabase();
  await startServer();
};

bootstrap();