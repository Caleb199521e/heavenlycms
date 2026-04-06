const { User } = require('./models');
require('dotenv').config();
const mongoose = require('mongoose');

async function debug() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heavenly-church');
  
  const users = await User.find();
  console.log('Users in database:', users.length);
  
  if (users.length > 0) {
    const admin = users.find(u => u.email === 'admin@heavenly.gh');
    if (admin) {
      console.log('\nAdmin user found:');
      console.log('Email:', admin.email);
      console.log('Password hash:', admin.password);
      console.log('IsActive:', admin.isActive);
      console.log('Role:', admin.role);
      
      // Test password comparison
      const isMatch = await admin.comparePassword('admin123');
      console.log('\nPassword "admin123" matches:', isMatch);
    } else {
      console.log('Admin user NOT found');
    }
  }
  
  mongoose.disconnect();
}

debug().catch(console.error);
