const dotenv = require('dotenv');

// Load env vars before anything else
dotenv.config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { startSimulator } = require('./utils/stockSimulator');

// Route files
const authRoutes = require('./routes/authRoutes');
const stockRoutes = require('./routes/stockRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TradeSphere Stock Trading API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    try {
      await connectDB();
      console.log('MongoDB Connection Status: SUCCESS');
    } catch (dbError) {
      console.error('MongoDB Connection Status: FAILED');
      console.error('CRITICAL WARNING: MongoDB connection failed on startup. Server running in offline mode.');
      console.error('Connection Error Message:', dbError.message);
    }

    app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
      );
      console.log(`API Base URL: http://localhost:${PORT}`);

      // Start stock simulator in production or if ENABLE_SIMULATOR flag is set
      if (
        process.env.NODE_ENV === 'production' ||
        process.env.ENABLE_SIMULATOR === 'true'
      ) {
        const interval = parseInt(process.env.SIMULATOR_INTERVAL, 10) || 30000;
        startSimulator(interval);
      }
    });
  } catch (error) {
    console.error('Fatal Error starting the Express server application:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
