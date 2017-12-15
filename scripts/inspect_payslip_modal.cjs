const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const payrollPage = path.join(svelteDir, 'src/routes/admin/hris/payroll/+page.svelte');
const lines = fs.readFileSync(payrollPage, 'utf8').split('\n');
console.log(lines.slice(790, 840).join('\n'));
