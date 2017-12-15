const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const payrollPage = path.join(svelteDir, 'src/routes/admin/hris/payroll/+page.svelte');
const content = fs.readFileSync(payrollPage, 'utf8');

console.log('=== Lines mentioning payslip or modal or deductions ===');
content.split('\n').forEach((l, i) => {
    if (l.includes('modal') || l.includes('loan_deductions') || l.includes('absence_deductions') || l.includes('Potongan') || l.includes('Slip Gaji')) {
        console.log(`L${i+1}: ${l}`);
    }
});
