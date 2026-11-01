const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_editorial_workspace';

  try {
    console.log(`[MongoDB] Connecting to database (${uri.includes('@') ? 'MongoDB Atlas' : uri})...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    isConnected = false;
    console.warn(`[MongoDB] Warning: Database connection not established (${err.message}).`);
    console.warn('[MongoDB] To enable persistent storage, configure MONGO_URI in backend/.env (e.g. MongoDB Atlas connection string).');
  }
};

const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      error: 'MongoDB unavailable. Please configure MONGO_URI in backend/.env to connect to MongoDB Atlas.'
    });
  }
  next();
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
};

module.exports = { connectDB, checkDbConnection, disconnectDB, getIsConnected: () => isConnected };
