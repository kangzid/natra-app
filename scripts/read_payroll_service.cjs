const fs = require('fs');
const path = require('path');

const mobileDir = 'e:/Semester-6/proyek-utama-informatika/code-projects/natra-mobile';
const servicePath = path.join(mobileDir, 'src/features/payroll/payroll.service.js');
console.log(fs.readFileSync(servicePath, 'utf8'));
