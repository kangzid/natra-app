const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const compPage = path.join(svelteDir, 'src/routes/admin/hris/compliance/+page.svelte');
const content = fs.readFileSync(compPage, 'utf8');

console.log('=== Header & Cards of compliance/+page.svelte ===');
console.log(content.split('\n').slice(380, 520).join('\n'));
