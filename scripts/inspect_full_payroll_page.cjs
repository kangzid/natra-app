const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const payrollPage = path.join(svelteDir, 'src/routes/admin/hris/payroll/+page.svelte');
const content = fs.readFileSync(payrollPage, 'utf8');

console.log('=== Lines 620 to 760 of payroll/+page.svelte ===');
console.log(content.split('\n').slice(620, 760).join('\n'));
