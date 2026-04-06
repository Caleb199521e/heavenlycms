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
    const todayAttendance = await Attendance.countDocuments({
      serviceId: { $in: todayServices.map(s => s._id) }
    });
    res.json({ totalMembers, totalVisitors, todayAttendance, todayServices: todayServices.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/trends', auth, async (req, res) => {
  try {
    const days = req.query.period === 'monthly' ? 30 : 7;
    const start = new Date(); start.setDate(start.getDate() - days);
    const services = await Service.find({ date: { $gte: start } }).sort({ date: 1 });
    const data = await Promise.all(services.map(async s => ({
      date: s.date, name: s.name, type: s.type,
      total: await Attendance.countDocuments({ serviceId: s._id }),
      members: await Attendance.countDocuments({ serviceId: s._id, attendeeType: 'member' }),
      visitors: await Attendance.countDocuments({ serviceId: s._id, attendeeType: 'visitor' }),
    })));
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
