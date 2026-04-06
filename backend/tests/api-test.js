const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let authToken = '';
let memberId = '';
let visitorId = '';
let serviceId = '';
let attendanceId = '';

const api = axios.create({
  baseURL: API_URL,
  validateStatus: () => true // Accept all status codes
});

const log = (title, status, data) => {
  const icon = status >= 200 && status < 300 ? '✅' : '❌';
  console.log(`\n${icon} ${title} (${status})`);
  if (data && typeof data === 'object') {
    console.log(JSON.stringify(data, null, 2).slice(0, 200) + '...');
  }
};

async function runTests() {
  console.log('🧪 Starting API Testing Suite\n');

  try {
    // 1. AUTH: Login
    console.log('\n=== AUTHENTICATION ===');
    let res = await api.post('/auth/login', {
      email: 'admin@heavenly.gh',
      password: 'admin123'
    });
    log('POST /auth/login', res.status, res.data);
    if (res.data.token) {
      authToken = res.data.token;
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    }

    // 2. AUTH: Get Current User
    res = await api.get('/auth/me');
    log('GET /auth/me', res.status, res.data);

    // 3. MEMBERS: Get all members
    console.log('\n=== MEMBERS ===');
    res = await api.get('/members');
    log('GET /members', res.status, res.data);
    if (res.data.members?.length > 0) {
      memberId = res.data.members[0]._id;
    }

    // 4. MEMBERS: Get single member
    if (memberId) {
      res = await api.get(`/members/${memberId}`);
      log('GET /members/:id', res.status, res.data);
    }

    // 5. MEMBERS: Create member
    res = await api.post('/members', {
      fullName: 'Test Member ' + Date.now(),
      phone: '0244999888',
      email: 'test@mail.com',
      department: 'Youth'
    });
    log('POST /members (Create)', res.status, res.data);
    if (res.data._id) {
      memberId = res.data._id;
    }

    // 6. MEMBERS: Update member
    if (memberId) {
      res = await api.put(`/members/${memberId}`, {
        fullName: 'Updated Member Name',
        phone: '0244111222'
      });
      log('PUT /members/:id (Update)', res.status, res.data);
    }

    // 7. VISITORS: Get all visitors
    console.log('\n=== VISITORS ===');
    res = await api.get('/visitors');
    log('GET /visitors', res.status, res.data);
    if (res.data?.length > 0) {
      visitorId = res.data[0]._id;
    }

    // 8. VISITORS: Create visitor
    res = await api.post('/visitors', {
      fullName: 'Test Visitor ' + Date.now(),
      phone: '0244777666',
      invitedBy: 'Member Test',
      visitCount: 1
    });
    log('POST /visitors (Create)', res.status, res.data);
    if (res.data._id) {
      visitorId = res.data._id;
    }

    // 9. SERVICES: Get all services
    console.log('\n=== SERVICES ===');
    res = await api.get('/services');
    log('GET /services', res.status, res.data);
    if (res.data?.length > 0) {
      serviceId = res.data[0]._id;
    }

    // 10. SERVICES: Create service
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    res = await api.post('/services', {
      name: 'Test Service ' + Date.now(),
      type: 'Sunday Service',
      date: futureDate,
      time: '09:00 AM',
      description: 'Test service for validation'
    });
    log('POST /services (Create)', res.status, res.data);
    if (res.data._id) {
      serviceId = res.data._id;
    }

    // 11. ATTENDANCE: Check in member
    console.log('\n=== ATTENDANCE ===');
    if (serviceId && memberId) {
      res = await api.post('/attendance/checkin', {
        serviceId,
        attendeeType: 'member',
        memberId
      });
      log('POST /attendance/checkin (Member)', res.status, res.data);
      if (res.data._id) {
        attendanceId = res.data._id;
      }
    }

    // 12. ATTENDANCE: Get by service
    if (serviceId) {
      res = await api.get(`/attendance/service/${serviceId}`);
      log('GET /attendance/service/:serviceId', res.status, res.data);
    }

    // 13. ATTENDANCE: Get by member
    if (memberId) {
      res = await api.get(`/attendance/member/${memberId}`);
      log('GET /attendance/member/:memberId', res.status, res.data);
    }

    // 14. REPORTS: Get summary
    console.log('\n=== REPORTS ===');
    res = await api.get('/reports/summary');
    log('GET /reports/summary', res.status, res.data);

    // 15. REPORTS: Get trends
    res = await api.get('/reports/trends?period=weekly');
    log('GET /reports/trends', res.status, res.data);

    // 16. VISITORS: Update visitor
    if (visitorId) {
      res = await api.put(`/visitors/${visitorId}`, {
        fullName: 'Updated Visitor',
        phone: '0244999777'
      });
      log('PUT /visitors/:id (Update)', res.status, res.data);
    }

    // 17. SERVICES: Update service
    if (serviceId) {
      res = await api.put(`/services/${serviceId}`, {
        description: 'Updated service description'
      });
      log('PUT /services/:id (Update)', res.status, res.data);
    }

    // 18. Verify duplicate check-in fails
    if (serviceId && memberId) {
      res = await api.post('/attendance/checkin', {
        serviceId,
        attendeeType: 'member',
        memberId
      });
      log('POST /attendance/checkin (Duplicate - Should fail)', res.status, res.data);
    }

    // 19. AUTH: Logout
    console.log('\n=== CLEANUP ===');
    res = await api.post('/auth/logout');
    log('POST /auth/logout', res.status, res.data);

    // 20. Test auth requirement
    delete api.defaults.headers.common['Authorization'];
    res = await api.get('/members');
    log('GET /members (No token - Should fail)', res.status, { error: res.data.message });

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Testing Complete!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run tests
runTests().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
