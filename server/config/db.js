const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Try multiple environment variable names and fallback to localhost
    const mongoURI = process.env.MONGODB_URI || 
                     process.env.MONGO_URI || 
                     process.env.DATABASE_URL ||
                     'mongodb://localhost:27017/janavaani-db';
    
    console.log('Attempting to connect to MongoDB...');
    console.log('Using URI:', mongoURI.replace(/\/\/.*:.*@/, '//***:***@')); // Hide credentials in logs
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('📝 Environment variables check:');
    console.log('   MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    console.log('   MONGO_URI:', process.env.MONGO_URI ? 'Set' : 'Not set');
    console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    process.exit(1);
  }
};

module.exports = connectDB;
