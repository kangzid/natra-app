const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const serverFile = path.join(svelteDir, 'src/routes/admin/hris/training/+page.server.ts');
console.log('=== +page.server.ts ===');
console.log(fs.readFileSync(serverFile, 'utf8'));

const pageFile = path.join(svelteDir, 'src/routes/admin/hris/training/+page.svelte');
console.log('=== +page.svelte (first 80 lines) ===');
console.log(fs.readFileSync(pageFile, 'utf8').split('\n').slice(0, 80).join('\n'));
