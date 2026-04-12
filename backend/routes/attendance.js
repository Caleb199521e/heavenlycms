const express = require('express');
const router = express.Router();
const { Attendance, Visitor, Service } = require('../models');
const auth = require('../middleware/auth');

// Helper function to get or create today's service by type
async function getOrCreateService(serviceType, userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Try to find today's service of this type
  let service = await Service.findOne({
    type: serviceType,
    date: { $gte: today, $lt: tomorrow }
  });

  // If no service exists today, create one
  if (!service) {
    service = await Service.create({
      name: `${serviceType} - ${today.toLocaleDateString('en-GH')}`,
      type: serviceType,
      date: new Date(today),
      time: serviceType === 'Sunday Service' ? '09:00' : '18:00',
      description: `Auto-created service for check-in`,
      createdBy: userId
    });
  }

  return service;
}

router.post('/checkin', auth, async (req, res) => {
  try {
    const { serviceType, attendeeType, memberId, visitorId } = req.body;
    
    // Validate required fields
    if (!serviceType || !attendeeType) {
      return res.status(400).json({ message: 'serviceType and attendeeType are required' });
    }
    
    // Validate serviceType
    const validServiceTypes = ['Sunday Service', 'Midweek Service', 'Special Event', 'Prayer Meeting', 'Bible Study'];
    if (!validServiceTypes.includes(serviceType)) {
      return res.status(400).json({ message: `serviceType must be one of: ${validServiceTypes.join(', ')}` });
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
    
    // Get or create today's service of this type
    const service = await getOrCreateService(serviceType, req.user.userId);
    
    const existing = await Attendance.findOne(
      attendeeType === 'member' ? { serviceId: service._id, memberId } : { serviceId: service._id, visitorId }
    );
    if (existing) return res.status(409).json({ message: 'Already checked in for this service' });
    
    const record = await Attendance.create({
      serviceId: service._id, attendeeType, memberId, visitorId,
      checkedInBy: req.user.userId
    });
    
    const populatedRecord = await record.populate([
      { path: 'memberId', select: 'fullName membershipId department phone' },
      { path: 'visitorId', select: 'fullName phone' },
      { path: 'serviceId', select: '_id name type date time' }
    ]);
    
    if (attendeeType === 'visitor' && visitorId) {
      await Visitor.findByIdAndUpdate(visitorId, {
        $inc: { visitCount: 1 }, lastVisitDate: new Date()
      });
    }
    res.status(201).json(populatedRecord);
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
