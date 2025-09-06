

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const teamRoutes = require('./routes/teams');
const ideaRoutes = require('./routes/ideas');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/ideas', ideaRoutes);

// Health with DB status
app.get('/api/health', (req, res) => {
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const db = states[mongoose.connection.readyState] || 'unknown';
  res.json({ status: 'ok', db });
});

// DB connect and server start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hackmate';

// Start HTTP server first so health endpoint works even if DB is down
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));

// Connect to MongoDB with simple retry logic (non-fatal on failure)
const connectWithRetry = (delayMs = 5000) => {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('MongoDB connected');
    })
    .catch((err) => {
      console.error(`MongoDB connection error: ${err.message}. Retrying in ${Math.round(delayMs / 1000)}s...`);
      setTimeout(() => connectWithRetry(Math.min(delayMs * 2, 30000)), delayMs);
    });
};

connectWithRetry();
