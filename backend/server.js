/**
 * CampusHub Backend Server
 * Main entry point for the Express.js application
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const assignmentRoutes = require('./routes/assignments');
const aiRoutes = require('./routes/ai');
const plannerRoutes = require('./routes/planner');
const cgpaRoutes = require('./routes/cgpa');
const communityRoutes = require('./routes/community');
const notificationRoutes = require('./routes/notifications');
const profileRoutes = require('./routes/profile');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(morgan('dev'));                          // HTTP request logger
app.use(express.json({ limit: '10mb' }));        // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Database Connection ──────────────────────────────────────────────────────

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campushub')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/auth',          authRoutes);
app.use('/api/notes',         notesRoutes);
app.use('/api/assignments',   assignmentRoutes);
app.use('/api/ai',            aiRoutes);
app.use('/api/planner',       plannerRoutes);
app.use('/api/cgpa',          cgpaRoutes);
app.use('/api/community',     communityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile',       profileRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CampusHub API is running 🚀', timestamp: new Date() });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error('🔴 Error:', err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CampusHub server running on http://localhost:${PORT}`);
  console.log(`📖 Environment: ${process.env.NODE_ENV || 'development'}`);
});
