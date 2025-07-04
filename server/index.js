const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const issueRoutes = require('./routes/issues');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes MUST come before static file serving
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve index.html for all other routes (SPA fallback), but NOT for API routes
app.get('*', (req, res) => {
  // Don't serve HTML for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});
