const mongoose = require('mongoose');

let useMemory = false;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    // In development, fall back to in-memory server
    if (process.env.NODE_ENV !== 'production') {
      console.log(`⚠️  Local MongoDB not available, starting in-memory server...`);
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await mongoose.connect(uri);
        useMemory = true;
        console.log(`✅ MongoDB In-Memory Server started successfully`);
      } catch (memError) {
        console.error(`❌ Failed to start in-memory MongoDB: ${memError.message}`);
        process.exit(1);
      }
    } else {
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
      process.exit(1);
    }
  }
  return useMemory;
};

module.exports = connectDB;
