const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const mobileDir = 'e:/Semester-6/proyek-utama-informatika\code-projects\natra-mobile';

console.log('=== 1. Checking contracts/+page.svelte top stats ===');
const contractsSvelte = path.join(svelteDir, 'src/routes/admin/hris/contracts/+page.svelte');
if (fs.existsSync(contractsSvelte)) {
    const lines = fs.readFileSync(contractsSvelte, 'utf8').split('\n');
    console.log(lines.slice(0, 100).join('\n'));
}

console.log('=== 2. Checking payroll/allowances/+page.server.ts and svelte ===');
const allowServer = path.join(svelteDir, 'src/routes/admin/hris/payroll/allowances/+page.server.ts');
if (fs.existsSync(allowServer)) {
    console.log(fs.readFileSync(allowServer, 'utf8'));
}
const allowSvelte = path.join(svelteDir, 'src/routes/admin/hris/payroll/allowances/+page.svelte');
if (fs.existsSync(allowSvelte)) {
    const lines = fs.readFileSync(allowSvelte, 'utf8').split('\n');
    console.log(lines.slice(0, 80).join('\n'));
}

console.log('=== 3. Checking natra-mobile/pages/payroll.html ===');
const mobPayroll = path.join(mobileDir, 'pages/payroll.html');
if (fs.existsSync(mobPayroll)) {
    console.log(fs.readFileSync(mobPayroll, 'utf8'));
}
