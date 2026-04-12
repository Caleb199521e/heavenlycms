const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── User Schema ───────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'usher', 'leader'], default: 'usher' },
  phone: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Member Schema ─────────────────────────────────────────────────────────────
const memberSchema = new mongoose.Schema({
  membershipId: { type: String, unique: true },
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  email: String,
  department: {
    type: String,
    enum: ['Choir', 'Ushers', 'Youth', 'Children', 'Men', 'Women', 'Elders', 'Media', 'Prayer', 'Other'],
    default: 'Other'
  },
  status: { type: String, enum: ['active', 'inactive', 'transferred'], default: 'active' },
  joinDate: { type: Date, default: Date.now },
  photo: String,
  address: String,
  dateOfBirth: Date,
  notes: String,
}, { timestamps: true });

memberSchema.pre('save', async function(next) {
  if (!this.membershipId) {
    const count = await mongoose.model('Member').countDocuments();
    this.membershipId = `HCG-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// ─── Visitor Schema ────────────────────────────────────────────────────────────
const visitorSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  email: String,
  invitedBy: String,
  invitedByMemberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  visitCount: { type: Number, default: 1 },
  firstVisitDate: { type: Date, default: Date.now },
  lastVisitDate: { type: Date, default: Date.now },
  convertedToMember: { type: Boolean, default: false },
  convertedMemberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  notes: String,
}, { timestamps: true });

// ─── Service Schema ────────────────────────────────────────────────────────────
const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['Sunday Service', 'Midweek Service', 'Special Event', 'Prayer Meeting', 'Bible Study'],
    required: true
  },
  date: { type: Date, required: true },
  time: String,
  description: String,
  expectedAttendance: Number,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// ─── Attendance Schema ─────────────────────────────────────────────────────────
const attendanceSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  attendeeType: { type: String, enum: ['member', 'visitor'], required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  visitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor' },
  checkinTime: { type: Date, default: Date.now },
  checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String,
}, { timestamps: true });

// Prevent duplicate attendance
// Only enforce uniqueness when memberId is present
attendanceSchema.index(
  { serviceId: 1, memberId: 1 },
  { 
    unique: true, 
    partialFilterExpression: { memberId: { $exists: true }, serviceId: { $exists: true } }
  }
);

// Only enforce uniqueness when visitorId is present
attendanceSchema.index(
  { serviceId: 1, visitorId: 1 },
  { 
    unique: true, 
    partialFilterExpression: { visitorId: { $exists: true }, serviceId: { $exists: true } }
  }
);

module.exports = {
  User: mongoose.model('User', userSchema),
  Member: mongoose.model('Member', memberSchema),
  Visitor: mongoose.model('Visitor', visitorSchema),
  Service: mongoose.model('Service', serviceSchema),
  Attendance: mongoose.model('Attendance', attendanceSchema),
};
