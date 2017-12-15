const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const mobileDir = 'e:/Semester-6/proyek-utama-informatika/code-projects/natra-mobile';

console.log('=== Checking payroll Svelte files ===');
const payrollDir = path.join(svelteDir, 'src/routes/admin/hris/payroll');
if (fs.existsSync(payrollDir)) {
    const walk = (dir) => {
        let results = [];
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            file = path.join(dir, file);
            const stat = fs.statSync(file);
            if (stat && stat.isDirectory()) {
                results = results.concat(walk(file));
            } else {
                results.push(file);
            }
        });
        return results;
    };
    console.log(walk(payrollDir).map(p => path.relative(payrollDir, p)));
}

console.log('=== Checking mobile profile slip gaji ===');
const mobileProfile = path.join(mobileDir, 'src/features/profile/profile.controller.js');
if (fs.existsSync(mobileProfile)) {
    const content = fs.readFileSync(mobileProfile, 'utf8');
    const lines = content.split('\n');
    lines.forEach((l, i) => {
        if (l.includes('salary') || l.includes('payslip') || l.includes('gaji') || l.includes('slip')) {
            console.log(`Mobile Profile L${i+1}: ${l}`);
        }
    });
}
