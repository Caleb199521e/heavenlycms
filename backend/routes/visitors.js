const express = require('express');
const router = express.Router();
const { Visitor } = require('../models');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { search } = req.query;
    const query = search ? {
      $or: [{ fullName: { $regex: search, $options: 'i' } }, { phone: { $regex: search, $options: 'i' } }]
    } : {};
    const visitors = await Visitor.find(query).sort({ lastVisitDate: -1 });
    // Ensure _id is explicitly included
    const visitorsWithId = visitors.map(v => ({
      ...v.toObject(),
      _id: v._id.toString() // Ensure _id is a string and included
    }));
    res.json(visitorsWithId);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const visitor = await Visitor.create(req.body);
    res.status(201).json(visitor);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const v = await Visitor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(v);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Visitor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Visitor deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
