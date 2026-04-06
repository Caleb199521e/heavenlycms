const express = require('express');
const router = express.Router();
const { Attendance, Visitor } = require('../models');
const auth = require('../middleware/auth');

router.post('/checkin', auth, async (req, res) => {
  try {
    const { serviceId, attendeeType, memberId, visitorId } = req.body;
    const existing = await Attendance.findOne(
      attendeeType === 'member' ? { serviceId, memberId } : { serviceId, visitorId }
    );
    if (existing) return res.status(409).json({ message: 'Already checked in for this service' });
    const record = await Attendance.create({
      serviceId, attendeeType, memberId, visitorId,
      checkedInBy: req.user.userId
    });
    if (attendeeType === 'visitor' && visitorId) {
      await Visitor.findByIdAndUpdate(visitorId, {
        $inc: { visitCount: 1 }, lastVisitDate: new Date()
      });
    }
    res.status(201).json(record);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.get('/service/:serviceId', auth, async (req, res) => {
  try {
    const records = await Attendance.find({ serviceId: req.params.serviceId })
      .populate('memberId', 'fullName membershipId department phone')
      .populate('visitorId', 'fullName phone')
      .populate('checkedInBy', 'name');
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/member/:memberId', auth, async (req, res) => {
  try {
    const records = await Attendance.find({ memberId: req.params.memberId, attendeeType: 'member' })
      .populate('serviceId', 'name type date time').sort({ createdAt: -1 });
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
