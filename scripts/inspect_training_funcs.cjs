const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const pageFile = path.join(svelteDir, 'src/routes/admin/hris/training/+page.svelte');
const lines = fs.readFileSync(pageFile, 'utf8').split('\n');
console.log('=== +page.svelte lines 80 to 250 ===');
console.log(lines.slice(80, 250).join('\n'));
