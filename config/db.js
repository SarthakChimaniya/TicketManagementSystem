const mongoose = require('mongoose');
const seedInitialData = require('./seedData');

let mongoMemoryServerInstance = null;

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies';

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    await seedInitialData();
  } catch (error) {
    console.warn(`[MongoDB] Primary connection failed (${error.message}). Initializing embedded MongoMemoryServer fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServerInstance = await MongoMemoryServer.create();
      const inMemoryUri = mongoMemoryServerInstance.getUri();
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`[MongoDB] Connected to embedded in-memory database: ${inMemoryUri}`);
      await seedInitialData();
    } catch (fallbackErr) {
      console.error(`[MongoDB Connection Error] Embedded fallback failed: ${fallbackErr.message}`);
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
