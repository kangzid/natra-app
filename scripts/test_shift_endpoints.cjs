const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  console.log('1. Logging in as Admin Tenant (ID 2)...');
  // Admin user 2 login
  const adminLogin = await request({
    hostname: 'localhost',
    port: 8000,
    path: '/api/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@majusejahtera.com', password: 'password123' });

  console.log('Admin login status:', adminLogin.status);
  const adminToken = adminLogin.body.token;

  if (!adminToken) {
    console.log('Failed to get admin token:', adminLogin.body);
    return;
  }

  console.log('2. Testing GET /api/hris/attendance-settings...');
  const settingsRes = await request({
    hostname: 'localhost',
    port: 8000,
    path: '/api/hris/attendance-settings',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('Settings response:', settingsRes.status, settingsRes.body);

  console.log('3. Testing POST /api/hris/attendance-settings (Saving shift disabled with 07:00 open, 08:00 work, 08:30 cut-off, 17:00 checkout)...');
  const saveSettingRes = await request({
    hostname: 'localhost',
    port: 8000,
    path: '/api/hris/attendance-settings',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, {
    is_shift_enabled: false,
    check_in_start: '07:00',
    work_start_time: '08:00',
    late_tolerance_time: '08:15',
    check_in_end: '08:30',
    lock_after_late_cutoff: true,
    late_cutoff_policy: 'empty',
    work_end_time: '17:00',
    min_checkout_at_work_end: true,
    require_geofence_checkout: true,
    edit_delete_limit_days: 0,
    allow_admin_bypass: true
  });
  console.log('Save settings response:', saveSettingRes.status, saveSettingRes.body);

  console.log('4. Testing POST /api/hris/shifts (Create Shift Pagi & Shift Siang)...');
  const createShift1 = await request({
    hostname: 'localhost',
    port: 8000,
    path: '/api/hris/shifts',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, {
    name: 'Shift Pagi',
    code: 'SHF-PAGI',
    check_in_start: '06:00',
    work_start_time: '07:00',
    late_tolerance_time: '07:15',
    check_in_end: '08:00',
    work_end_time: '15:00',
    is_night_shift: false,
    color: '#3b82f6',
    is_active: true
  });
  console.log('Create Shift 1:', createShift1.status, createShift1.body);

  const createShift2 = await request({
    hostname: 'localhost',
    port: 8000,
    path: '/api/hris/shifts',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, {
    name: 'Shift Siang',
    code: 'SHF-SIANG',
    check_in_start: '14:00',
    work_start_time: '15:00',
    late_tolerance_time: '15:15',
    check_in_end: '16:00',
    work_end_time: '23:00',
    is_night_shift: false,
    color: '#f59e0b',
    is_active: true
  });
  console.log('Create Shift 2:', createShift2.status, createShift2.body);

  console.log('5. Logging in as Employee Agus Darsono...');
  const empLogin = await request({
    hostname: 'localhost',
    port: 8000,
    path: '/api/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'agus01@majusejahtera.com', password: 'password123' });

  const empToken = empLogin.body.token;

  console.log('6. Testing GET /api/attendances/today for Agus Darsono...');
  const todayRes = await request({
    hostname: 'localhost',
    port: 8000,
    path: '/api/attendances/today',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${empToken}` }
  });
  console.log('Employee Today Attendance & Schedule:', todayRes.status, todayRes.body);
}

test();
