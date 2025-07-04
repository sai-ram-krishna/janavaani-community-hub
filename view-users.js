// Simple script to view all users in the database
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./server/models/user');

async function viewUsers() {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/janavaani-db';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    
    if (users.length === 0) {
      console.log('📝 No users found in the database.\n');
      return;
    }

    console.log(`👥 Total Users: ${users.length}\n`);
    console.log('='.repeat(80));
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   📱 Phone: ${user.phone}`);
      console.log(`   👤 Type: ${user.userType}`);
      if (user.department) {
        console.log(`   🏢 Department: ${user.department}`);
      }
      console.log(`   📅 Joined: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}`);
      console.log('-'.repeat(40));
    });

    // Summary stats
    const citizens = users.filter(u => u.userType === 'citizen').length;
    const government = users.filter(u => u.userType === 'government').length;
    
    console.log('\n📊 Summary:');
    console.log(`   Citizens: ${citizens}`);
    console.log(`   Government Officials: ${government}`);
    console.log(`   Total: ${users.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed.');
  }
}

viewUsers();
