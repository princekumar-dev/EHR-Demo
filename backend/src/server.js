import dotenv from 'dotenv';
import app from './app.js';
import { connectDatabase } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME; // optional override to choose a specific DB

if (!MONGO_URI) {
  throw new Error('MONGO_URI must be defined');
}

const startServer = async () => {
  try {
  await connectDatabase(MONGO_URI, MONGO_DB_NAME);
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
