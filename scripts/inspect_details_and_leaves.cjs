const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const backendDir = path.resolve('../backup/tracker-loc-backend');

// 1. Check Employee Detail page
const empDetailSvelte = path.join(svelteDir, 'src/routes/admin/employees/[id]/+page.svelte');
console.log('=== Employee Detail +page.svelte (search for "Hanya Baca" and "Cicilan") ===');
const empDetailContent = fs.readFileSync(empDetailSvelte, 'utf8');
const empLines = empDetailContent.split('\n');
empLines.forEach((line, idx) => {
    if (line.includes('Hanya Baca') || line.includes('Cicilan') || line.includes('cicilan') || line.includes('monthly_installment') || line.includes('loans') || line.includes('kasbon')) {
        console.log(`Line ${idx+1}: ${line}`);
    }
});

// 2. Check Pengaturan Cuti page
const cutiSvelte = path.join(svelteDir, 'src/routes/admin/hris/pengajuan/pengaturan-cuti/+page.svelte');
console.log('\n=== Pengaturan Cuti +page.svelte ===');
const cutiContent = fs.readFileSync(cutiSvelte, 'utf8');
const cutiLines = cutiContent.split('\n');
cutiLines.forEach((line, idx) => {
    if (line.includes('Sisa') || line.includes('sisa') || line.includes('remaining') || line.includes('quota') || line.includes('used_days') || line.includes('terpakai')) {
        console.log(`Line ${idx+1}: ${line}`);
    }
});

// 3. Check HrisLeaveSettingController.php
const leaveSettingCtrl = path.join(backendDir, 'app/Http/Controllers/Api/HrisLeaveSettingController.php');
console.log('\n=== HrisLeaveSettingController.php ===');
if (fs.existsSync(leaveSettingCtrl)) {
    console.log(fs.readFileSync(leaveSettingCtrl, 'utf8'));
}
