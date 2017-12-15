const fs = require('fs');
const path = require('path');

const mobileDir = 'e:/Semester-6/proyek-utama-informatika/code-projects/natra-mobile';

console.log('=== pages/payroll.html ===');
console.log(fs.readFileSync(path.join(mobileDir, 'pages/payroll.html'), 'utf8'));

console.log('=== src/features/payroll/payroll.controller.js ===');
console.log(fs.readFileSync(path.join(mobileDir, 'src/features/payroll/payroll.controller.js'), 'utf8'));
