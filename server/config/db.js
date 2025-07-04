const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/janavaani-db';
    console.log('Attempting to connect to MongoDB:', mongoURI);
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('📝 Make sure MongoDB is running on your system or update MONGODB_URI in .env');
    console.log('   To install MongoDB: https://www.mongodb.com/try/download/community');
    process.exit(1);
  }
};

module.exports = connectDB;
