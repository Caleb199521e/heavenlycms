const express = require('express');
const router = express.Router();
const { Attendance, Visitor } = require('../models');
const auth = require('../middleware/auth');

router.post('/checkin', auth, async (req, res) => {
  try {
    const { serviceId, attendeeType, memberId, visitorId } = req.body;
    
    // Validate required fields
    if (!serviceId || !attendeeType) {
      return res.status(400).json({ message: 'serviceId and attendeeType are required' });
    }
    
    // Validate attendeeType
    if (!['member', 'visitor'].includes(attendeeType)) {
      return res.status(400).json({ message: 'attendeeType must be either "member" or "visitor"' });
    }
    
    // Validate that the appropriate ID is provided
    if (attendeeType === 'member' && !memberId) {
      return res.status(400).json({ message: 'memberId is required for member attendance' });
    }
    if (attendeeType === 'visitor' && !visitorId) {
      return res.status(400).json({ message: 'visitorId is required for visitor attendance' });
    }
    
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

router.delete('/checkin/:attendanceId', auth, async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    await Attendance.findByIdAndDelete(attendanceId);
    res.json({ message: 'Checked out successfully' });
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
