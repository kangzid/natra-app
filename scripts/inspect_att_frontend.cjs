const fs = require('fs');

console.log('=== Checking Svelte Attendances Page ===');
const svelteAtt = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack/src/routes/admin/attendances/+page.svelte';
if (fs.existsSync(svelteAtt)) {
  console.log('Admin Attendances page exists! Lines:', fs.readFileSync(svelteAtt, 'utf8').split('\n').length);
}

console.log('=== Checking HRIS Layout Navigation ===');
const svelteHrisLayout = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack/src/routes/admin/hris/+layout.svelte';
if (fs.existsSync(svelteHrisLayout)) {
  console.log(fs.readFileSync(svelteHrisLayout, 'utf8'));
}

console.log('=== Checking Mobile attendance.html and controller ===');
if (fs.existsSync('pages/attendance.html')) {
  console.log('attendance.html lines:', fs.readFileSync('pages/attendance.html', 'utf8').split('\n').length);
}
if (fs.existsSync('src/features/attendance/attendance.controller.js')) {
  console.log('attendance.controller.js lines:', fs.readFileSync('src/features/attendance/attendance.controller.js', 'utf8').split('\n').length);
}
if (fs.existsSync('src/features/attendance/attendance.service.js')) {
  console.log(fs.readFileSync('src/features/attendance/attendance.service.js', 'utf8'));
}
