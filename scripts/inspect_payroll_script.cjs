const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const payrollPage = path.join(svelteDir, 'src/routes/admin/hris/payroll/+page.svelte');
const content = fs.readFileSync(payrollPage, 'utf8');

console.log('=== Lines 1 to 70 of payroll/+page.svelte ===');
console.log(content.split('\n').slice(0, 70).join('\n'));
