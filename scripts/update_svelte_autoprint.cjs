const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const payrollPage = path.join(svelteDir, 'src/routes/admin/hris/payroll/+page.svelte');
let content = fs.readFileSync(payrollPage, 'utf8');

content = content.replace(
    'const url = `${PUBLIC_API_URL}/hris/payrolls/payslips/${slipId}/download-pdf?token=${data.token}`;',
    'const url = `${PUBLIC_API_URL}/hris/payrolls/payslips/${slipId}/download-pdf?token=${data.token}&autoprint=1`;'
);

fs.writeFileSync(payrollPage, content, 'utf8');
console.log('Updated printIndividualSlip to include &autoprint=1 in Svelte!');
