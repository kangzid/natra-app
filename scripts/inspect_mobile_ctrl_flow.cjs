const fs = require('fs');
const path = require('path');

const mobileDir = 'e:/Semester-6/proyek-utama-informatika/code-projects/natra-mobile';
const payrollCtrlPath = path.join(mobileDir, 'src/features/payroll/payroll.controller.js');
const content = fs.readFileSync(payrollCtrlPath, 'utf8');

console.log('=== Lines 1 to 150 of payroll.controller.js ===');
console.log(content.split('\n').slice(0, 150).join('\n'));
