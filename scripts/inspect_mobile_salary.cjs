const fs = require('fs');
const path = require('path');

const mobileDir = 'e:/Semester-6/proyek-utama-informatika/code-projects/natra-mobile';
const profCtrl = path.join(mobileDir, 'src/features/profile/profile.controller.js');
const content = fs.readFileSync(profCtrl, 'utf8');

console.log('=== profile.controller.js lines 260 to 340 ===');
console.log(content.split('\n').slice(260, 340).join('\n'));
