const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const typeFile = path.join(svelteDir, 'src/lib/types/attendance.ts');
console.log(fs.readFileSync(typeFile, 'utf8'));
