import mongoose from 'mongoose';

export const connectDatabase = async (mongoUri, dbName) => {
  mongoose.set('strictQuery', true);

  try {
    // Allow overriding the database name via dbName parameter (useful when you
    // want to keep data in a separate database instead of the one encoded in
    // the connection string). Mongoose accepts `dbName` in connect options.
    const connectOptions = {
      autoIndex: true,
      ...(dbName ? { dbName } : {}),
    };

    await mongoose.connect(mongoUri, connectOptions);

    // Log a clear success message so it's obvious when MongoDB is connected
    // Also attach basic connection event handlers for helpful runtime info
    const { host, port, name } = mongoose.connection;
    console.log(`MongoDB connected: ${host}:${port}/${name}`);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    return mongoose.connection;
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message || err);
    throw err;
  }
};
