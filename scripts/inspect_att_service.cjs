const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const attService = path.join(svelteDir, 'src/lib/services/attendance.service.ts');
console.log('=== attendance.service.ts ===');
console.log(fs.readFileSync(attService, 'utf8'));
