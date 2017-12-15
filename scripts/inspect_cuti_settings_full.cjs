const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const backendDir = path.resolve('../backup/tracker-loc-backend');

const cutiSvelte = path.join(svelteDir, 'src/routes/admin/hris/pengajuan/pengaturan-cuti/+page.svelte');
const cutiServer = path.join(svelteDir, 'src/routes/admin/hris/pengajuan/pengaturan-cuti/+page.server.ts');
const leaveBalanceModel = path.join(backendDir, 'app/Models/HrisEmployeeLeaveBalance.php');

console.log('=== pengaturan-cuti/+page.svelte ===');
console.log(fs.readFileSync(cutiSvelte, 'utf8'));

console.log('=== pengaturan-cuti/+page.server.ts ===');
console.log(fs.readFileSync(cutiServer, 'utf8'));

console.log('=== HrisEmployeeLeaveBalance.php ===');
if (fs.existsSync(leaveBalanceModel)) {
    console.log(fs.readFileSync(leaveBalanceModel, 'utf8'));
}
