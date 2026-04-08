const mongoose = require('mongoose');
const { Member, Visitor, Service, Attendance } = require('./models');
require('dotenv').config();

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heavenly-church');
    console.log('✅ Connected to MongoDB');

    // Delete all members
    const memberResult = await Member.deleteMany({});
    console.log(`✅ Deleted ${memberResult.deletedCount} members`);

    // Delete all visitors
    const visitorResult = await Visitor.deleteMany({});
    console.log(`✅ Deleted ${visitorResult.deletedCount} visitors`);

    // Delete all services
    const serviceResult = await Service.deleteMany({});
    console.log(`✅ Deleted ${serviceResult.deletedCount} services`);

    // Delete all attendance records
    const attendanceResult = await Attendance.deleteMany({});
    console.log(`✅ Deleted ${attendanceResult.deletedCount} attendance records`);

    console.log('\n✅ Database cleanup complete!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

cleanup();
