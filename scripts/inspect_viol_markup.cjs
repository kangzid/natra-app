const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const violPage = path.join(svelteDir, 'src/routes/admin/hris/violations/+page.svelte');
const content = fs.readFileSync(violPage, 'utf8');

console.log('=== Header & KPI Cards of violations/+page.svelte ===');
console.log(content.split('\n').slice(330, 470).join('\n'));
