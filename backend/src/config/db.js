const mongoose = require('mongoose');

/**
 * Connect to MongoDB instance using Mongoose.
 * In development, if local MongoDB is unreachable, it transparently falls back
 * to an embedded in-memory MongoDB instance for zero-friction local setup.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    await autoSeedIfEmpty();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Database Notice] External MongoDB unreachable (${error.message}).`
      );
      console.log(
        '[Database Notice] Starting embedded in-memory MongoDB for local development...'
      );

      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        const conn = await mongoose.connect(uri);
        console.log(
          `[Database] In-memory MongoDB active: ${conn.connection.host}`
        );
        await autoSeedIfEmpty();
        return;
      } catch (fallbackErr) {
        console.error(
          `[Database Error] Embedded database startup failed: ${fallbackErr.message}`
        );
      }
    }

    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const autoSeedIfEmpty = async () => {
  if (process.env.NODE_ENV === 'test') return;
  try {
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Database Notice] Empty database detected. Auto-seeding initial users and complaints...');
      const seedData = require('../utils/seed');
      await seedData(false);
    }
  } catch (err) {
    console.error('[Database Notice] Auto-seed failed:', err.message);
  }
};

module.exports = connectDB;
