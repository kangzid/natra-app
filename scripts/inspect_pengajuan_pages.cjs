const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const cutiPath = path.join(svelteDir, 'src/routes/admin/hris/pengajuan/pengaturan-cuti/+page.svelte');
const sakitPath = path.join(svelteDir, 'src/routes/admin/hris/pengajuan/izin-sakit/+page.svelte');
const absenPath = path.join(svelteDir, 'src/routes/admin/hris/pengajuan/izin-absen/+page.svelte');
const izinCutiPath = path.join(svelteDir, 'src/routes/admin/hris/pengajuan/izin-cuti/+page.svelte');

console.log('=== izin-sakit header lines ===');
if (fs.existsSync(sakitPath)) {
    console.log(fs.readFileSync(sakitPath, 'utf8').split('\n').slice(0, 70).join('\n'));
}

console.log('=== izin-absen header lines ===');
if (fs.existsSync(absenPath)) {
    console.log(fs.readFileSync(absenPath, 'utf8').split('\n').slice(0, 70).join('\n'));
}

console.log('=== izin-cuti header lines ===');
if (fs.existsSync(izinCutiPath)) {
    console.log(fs.readFileSync(izinCutiPath, 'utf8').split('\n').slice(0, 70).join('\n'));
}
