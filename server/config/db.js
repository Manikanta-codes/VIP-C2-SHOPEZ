const mongoose = require('mongoose');

const connectDB = async () => {
  const MAX_RETRIES = 5;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log(`MongoDB Connected: ${conn.connection.host}`);

      // Connection event listeners
      mongoose.connection.on('error', (err) => {
        console.error(`MongoDB connection error: ${err.message}`);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected. Attempting to reconnect...');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected successfully');
      });

      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
      });

      return conn;
    } catch (error) {
      retries += 1;
      console.error(
        `MongoDB connection attempt ${retries}/${MAX_RETRIES} failed: ${error.message}`
      );

      if (retries >= MAX_RETRIES) {
        console.error('MongoDB Atlas Connection Error: Max retries reached. Database is offline.');
        throw new Error('Database connection failed: Max retries reached.');
      }

      // Wait before retrying (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, retries), 30000);
      console.log(`Retrying in ${waitTime / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
};

module.exports = connectDB;
