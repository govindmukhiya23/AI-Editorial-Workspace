const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB } = require('./config/db');
const researchRoutes = require('./routes/researchRoutes');
const writingRoutes = require('./routes/writingRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Connect to Database (auto-detects Atlas or local Mongo, falls back to memory store)
connectDB();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});
app.use('/api/', limiter);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const isMongoConnected = mongoose.connection.readyState === 1;
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AI Editorial Workspace API',
    version: '2.0.0',
    database: isMongoConnected ? 'mongodb-connected' : 'in-memory-fallback',
    storageMode: isMongoConnected ? 'MongoDB Atlas / Local' : 'In-Memory (Set MONGO_URI in .env for Atlas)'
  });
});

// Module API Routes
app.use('/api/research', researchRoutes);
app.use('/api/writing', writingRoutes);
app.use('/api/newsletter', newsletterRoutes);

// 404 Handler for undefined routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Central Error Handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` AI Editorial Workspace Server Running`);
  console.log(` Port: ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Health: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection at Promise]', reason);
});

module.exports = { app, server };
