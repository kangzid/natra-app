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
  console.log('1. Logging in as Admin...');
  const loginRes = await request({
    hostname: 'localhost',
    port: 8000,
    path: '/api/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@majusejahtera.com', password: 'password123' });

  const token = loginRes.body.token;
  console.log('Login status:', loginRes.status, 'Token exists:', !!token);

  console.log('2. Testing POST /api/hris/attendance-settings...');
  const saveRes = await request({
    hostname: 'localhost',
    port: 8000,
    path: '/api/hris/attendance-settings',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
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
    require_geofence_checkout: true
  });

  console.log('POST /api/hris/attendance-settings Status:', saveRes.status);
  console.log('Response body:', saveRes.body);
}

test();
