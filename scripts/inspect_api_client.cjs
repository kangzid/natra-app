const fs = require('fs');
const path = require('path');

const mobileDir = 'e:/Semester-6/proyek-utama-informatika/code-projects/natra-mobile';
const apiClientPath = path.join(mobileDir, 'src/core/api/api-client.js');
console.log(fs.readFileSync(apiClientPath, 'utf8'));
