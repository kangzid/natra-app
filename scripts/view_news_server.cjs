const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const serverFile = path.join(svelteDir, 'src/routes/admin/hris/news/+page.server.ts');
console.log('=== +page.server.ts ===');
console.log(fs.readFileSync(serverFile, 'utf8'));
