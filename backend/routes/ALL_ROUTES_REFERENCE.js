// ============================================================
// middleware/auth.js
// ============================================================
// const jwt = require('jsonwebtoken');
// module.exports = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).json({ message: 'No token' });
//   try {
//     req.user = jwt.verify(token, process.env.JWT_SECRET || 'heavenly-church-secret');
//     next();
//   } catch { res.status(401).json({ message: 'Invalid token' }); }
// };

// ============================================================
// routes/members.js  — Full CRUD
// ============================================================
/*
const express = require('express');
const router = express.Router();
const { Member } = require('../models');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { search, department, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { membershipId: { $regex: search, $options: 'i' } }
    ];
    if (department) query.department = department;
    if (status) query.status = status;
    const members = await Member.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Member.countDocuments(query);
    res.json({ members, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const member = await Member.create(req.body);
    res.status(201).json(member);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(member);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: 'Member deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
*/

// ============================================================
// routes/attendance.js
// ============================================================
/*
const express = require('express');
const router = express.Router();
const { Attendance, Member, Visitor } = require('../models');
const auth = require('../middleware/auth');

// Quick check-in
router.post('/checkin', auth, async (req, res) => {
  try {
    const { serviceId, attendeeType, memberId, visitorId } = req.body;
    const existing = await Attendance.findOne(
      attendeeType === 'member' ? { serviceId, memberId } : { serviceId, visitorId }
    );
    if (existing) return res.status(409).json({ message: 'Already checked in' });
    const record = await Attendance.create({
      serviceId, attendeeType, memberId, visitorId,
      checkedInBy: req.user.userId
    });
    // Update visitor stats
    if (attendeeType === 'visitor' && visitorId) {
      await Visitor.findByIdAndUpdate(visitorId, {
        $inc: { visitCount: 1 }, lastVisitDate: new Date()
      });
    }
    res.status(201).json(record);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Get attendance by service
router.get('/service/:serviceId', auth, async (req, res) => {
  try {
    const records = await Attendance.find({ serviceId: req.params.serviceId })
      .populate('memberId', 'fullName membershipId department')
      .populate('visitorId', 'fullName phone')
      .populate('checkedInBy', 'name');
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
*/

// ============================================================
// routes/reports.js
// ============================================================
/*
const express = require('express');
const router = express.Router();
const { Attendance, Member, Visitor, Service } = require('../models');
const auth = require('../middleware/auth');

router.get('/summary', auth, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
    const [totalMembers, totalVisitors, todayServices] = await Promise.all([
      Member.countDocuments({ status: 'active' }),
      Visitor.countDocuments(),
      Service.find({ date: { $gte: today, $lt: tomorrow } })
    ]);
    const todayServiceIds = todayServices.map(s => s._id);
    const todayAttendance = await Attendance.countDocuments({ serviceId: { $in: todayServiceIds } });
    res.json({ totalMembers, totalVisitors, todayAttendance });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/trends', auth, async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;
    const days = period === 'monthly' ? 30 : 7;
    const start = new Date(); start.setDate(start.getDate() - days);
    const services = await Service.find({ date: { $gte: start } });
    const data = await Promise.all(services.map(async s => ({
      date: s.date,
      name: s.name,
      count: await Attendance.countDocuments({ serviceId: s._id })
    })));
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
*/

// ============================================================
// seed/seed.js — Run with: node seed/seed.js
// ============================================================
/*
const mongoose = require('mongoose');
const { User, Member, Visitor, Service } = require('../models');
require('dotenv').config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heavenly-church');
  await Promise.all([User.deleteMany(), Member.deleteMany(), Visitor.deleteMany(), Service.deleteMany()]);

  await User.create([
    { name: 'Admin User', email: 'admin@heavenly.gh', password: 'admin123', role: 'admin' },
    { name: 'Kofi Mensah', email: 'usher@heavenly.gh', password: 'usher123', role: 'usher' },
    { name: 'Ama Asante', email: 'leader@heavenly.gh', password: 'leader123', role: 'leader' },
  ]);

  const depts = ['Choir', 'Ushers', 'Youth', 'Children', 'Men', 'Women', 'Prayer'];
  await Member.create([
    { fullName: 'Kwame Boateng', phone: '0244123456', department: 'Choir', email: 'kwame@email.com' },
    { fullName: 'Abena Owusu', phone: '0544987654', department: 'Women', email: 'abena@email.com' },
    { fullName: 'Yaw Darko', phone: '0204567890', department: 'Ushers' },
    { fullName: 'Akosua Frimpong', phone: '0554321098', department: 'Youth' },
    { fullName: 'Kofi Acheampong', phone: '0244765432', department: 'Elders' },
    { fullName: 'Efua Mensah', phone: '0504876543', department: 'Children' },
    { fullName: 'Nana Oppong', phone: '0244234567', department: 'Prayer' },
    { fullName: 'Adwoa Asante', phone: '0554345678', department: 'Choir' },
    { fullName: 'Kweku Amoah', phone: '0204456789', department: 'Men' },
    { fullName: 'Ama Boateng', phone: '0244567890', department: 'Media' },
  ]);

  await Visitor.create([
    { fullName: 'Josephine Tetteh', phone: '0244111222', invitedBy: 'Kwame Boateng' },
    { fullName: 'Richard Adjei', phone: '0554222333', invitedBy: 'Abena Owusu', visitCount: 3 },
    { fullName: 'Grace Amponsah', phone: '0204333444', invitedBy: 'Friend' },
  ]);

  const now = new Date();
  await Service.create([
    { name: 'Sunday Worship Service', type: 'Sunday Service', date: now, time: '09:00 AM' },
    { name: 'Midweek Bible Study', type: 'Midweek Service', date: new Date(now.setDate(now.getDate()-3)), time: '06:00 PM' },
    { name: 'Easter Special Service', type: 'Special Event', date: new Date(now.setDate(now.getDate()-7)), time: '08:00 AM' },
  ]);

  console.log('Database seeded successfully!');
  console.log('Login credentials:\n  admin@heavenly.gh / admin123\n  usher@heavenly.gh / usher123\n  leader@heavenly.gh / leader123');
  mongoose.disconnect();
}

seed().catch(console.error);
*/

console.log('See comments above for all route implementations.');
console.log('Run: npm install express mongoose bcryptjs jsonwebtoken cors dotenv');
