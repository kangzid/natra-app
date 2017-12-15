const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const svelteFile = path.join(svelteDir, 'src/routes/admin/hris/contracts/+page.svelte');
const content = fs.readFileSync(svelteFile, 'utf8');

console.log('=== Lines 240 to 350 of contracts/+page.svelte ===');
console.log(content.split('\n').slice(240, 350).join('\n'));
