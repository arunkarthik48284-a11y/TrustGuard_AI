const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDb } = require('./config/db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const scanRoutes = require('./routes/scanRoutes');
const policyRoutes = require('./routes/policyRoutes');
const auditRoutes = require('./routes/auditRoutes');

dotenv.config();

const app = express();

// Initialize DB pool / fallback store on startup
initDb().catch(err => console.warn('DB initialization notice:', err.message));

// Security & Middleware Configuration
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'healthy',
    system: 'TrustGuard AI Security Engine',
    version: '1.0.0',
    platform: 'Vercel Serverless Active',
    timestamp: new Date().toISOString()
  });
});

// API Routes Mounting (Dual Prefix for Vercel Serverless & Express Dev Server)
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/security', '/security'], scanRoutes);
app.use(['/api/security', '/security'], auditRoutes);
app.use(['/api/policies', '/policies'], policyRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected security engine error occurred.'
  });
});

module.exports = app;
