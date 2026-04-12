const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const requestLogger = require('./middleware/requestLogger');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter, loginLimiter } = require('./middleware/rateLimiter');

dotenv.config();

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
}));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use('/api', apiLimiter);
app.post('/api/auth/login', loginLimiter);

// Health check (unprotected)
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/members', require('./routes/members'));
app.use('/api/visitors', require('./routes/visitors'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/services', require('./routes/services'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/users', require('./routes/users'));


// Global error handling (must be last)
app.use(errorHandler);

// Fix attendance indexes (drop old ones with null handling issues, recreate with partialFilterExpression)
const fixAttendanceIndexes = async () => {
  try {
    const { Attendance } = require('./models');
    const db = Attendance.db;
    
    // Drop ALL indexes on the collection first (except _id)
    const indexes = await Attendance.collection.getIndexes();
    console.log('📋 Current indexes:', Object.keys(indexes));
    
    for (const indexName of Object.keys(indexes)) {
      if (indexName !== '_id_') {
        try {
          await Attendance.collection.dropIndex(indexName);
          console.log(`🗑️  Dropped index: ${indexName}`);
        } catch (e) {
          console.log(`⚠️  Index drop info (${indexName}):`, e.message);
        }
      }
    }
    
    // Wait a moment for cleanup
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Now recreate with proper partialFilterExpression
    await Attendance.collection.createIndex(
      { serviceId: 1, memberId: 1 },
      { 
        unique: true, 
        partialFilterExpression: { 
          memberId: { $exists: true },
          serviceId: { $exists: true }
        }
      }
    );
    console.log('✅ Created memberId unique index with partial filter');
    
    await Attendance.collection.createIndex(
      { serviceId: 1, visitorId: 1 },
      { 
        unique: true, 
        partialFilterExpression: { 
          visitorId: { $exists: true },
          serviceId: { $exists: true }
        }
      }
    );
    console.log('✅ Created visitorId unique index with partial filter');
  } catch (err) {
    console.warn('⚠️  Index fix info:', err.message);
  }
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heavenly-church', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('✅ MongoDB connected');
  
  // Fix indexes
  await fixAttendanceIndexes();
  
  app.listen(process.env.PORT || 5000, () => {
    console.log(`✅ Server running on port ${process.env.PORT || 5000}`);
    console.log(`🔒 Security: Rate limiting enabled, validation active, helmet headers set`);
  });
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

module.exports = app;
