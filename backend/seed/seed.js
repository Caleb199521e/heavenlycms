const mongoose = require('mongoose');
const { User, Member, Visitor, Service } = require('../models');
require('dotenv').config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heavenly-church');
  console.log('Connected. Clearing existing data...');
  
  try {
    await User.collection.drop();
    await Member.collection.drop();
    await Visitor.collection.drop();
    await Service.collection.drop();
  } catch (err) {
    // Collections might not exist yet, that's okay
  }

  await User.create([
    { name: 'Pastor Emmanuel Asante', email: 'admin@heavenly.gh', password: 'admin123', role: 'admin', phone: '0244000001' },
    { name: 'Kofi Mensah', email: 'usher@heavenly.gh', password: 'usher123', role: 'usher', phone: '0244000002' },
    { name: 'Ama Darko', email: 'leader@heavenly.gh', password: 'leader123', role: 'leader', phone: '0244000003' },
  ]);

  await Member.create([
    { fullName: 'Kwame Boateng', phone: '0244123456', email: 'kwame@email.com', department: 'Choir' },
    { fullName: 'Abena Owusu', phone: '0544987654', email: 'abena@email.com', department: 'Women' },
    { fullName: 'Yaw Darko', phone: '0204567890', department: 'Ushers' },
    { fullName: 'Akosua Frimpong', phone: '0554321098', department: 'Youth' },
    { fullName: 'Kofi Acheampong', phone: '0244765432', department: 'Elders' },
    { fullName: 'Efua Mensah', phone: '0504876543', department: 'Children' },
    { fullName: 'Nana Oppong', phone: '0244234567', department: 'Prayer' },
    { fullName: 'Adwoa Asante', phone: '0554345678', department: 'Choir' },
    { fullName: 'Kweku Amoah', phone: '0204456789', department: 'Men', status: 'inactive' },
    { fullName: 'Ama Boateng', phone: '0244567890', department: 'Media' },
  ]);

  await Visitor.create([
    { fullName: 'Josephine Tetteh', phone: '0244111222', invitedBy: 'Kwame Boateng' },
    { fullName: 'Richard Adjei', phone: '0554222333', invitedBy: 'Abena Owusu', visitCount: 3 },
    { fullName: 'Grace Amponsah', phone: '0204333444', invitedBy: 'Friend', visitCount: 2 },
  ]);

  const now = new Date();
  await Service.create([
    { name: 'Sunday Worship Service', type: 'Sunday Service', date: now, time: '09:00 AM' },
    { name: 'Midweek Bible Study', type: 'Midweek Service', date: new Date(now.getFullYear(), now.getMonth(), now.getDate()-3), time: '06:00 PM' },
    { name: 'New Year Special Service', type: 'Special Event', date: new Date('2025-01-01'), time: '08:00 AM' },
  ]);

  console.log('\n✅ Database seeded successfully!');
  console.log('Login credentials:');
  console.log('  Admin:  admin@heavenly.gh  / admin123');
  console.log('  Usher:  usher@heavenly.gh  / usher123');
  console.log('  Leader: leader@heavenly.gh / leader123');
  mongoose.disconnect();
}

seed().catch(console.error);
