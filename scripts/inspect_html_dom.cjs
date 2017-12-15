const fs = require('fs');
const path = require('path');

const mobileDir = 'e:/Semester-6/proyek-utama-informatika/code-projects/natra-mobile';
const htmlPath = path.join(mobileDir, 'pages/payroll.html');
console.log(fs.readFileSync(htmlPath, 'utf8'));
