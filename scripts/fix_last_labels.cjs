const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack/src/routes/admin/hris/pengajuan';

// 1. pengaturan-cuti
const pPath = path.join(svelteDir, 'pengaturan-cuti/+page.svelte');
let pContent = fs.readFileSync(pPath, 'utf8');
pContent = pContent.replace(
    '<label class="block font-semibold text-foreground mb-1">Otomatisasi Kehadiran Absensi</label>',
    '<span class="block font-semibold text-foreground mb-1">Otomatisasi Kehadiran Absensi</span>'
);
fs.writeFileSync(pPath, pContent, 'utf8');

// 2. other pages
['izin-absen/+page.svelte', 'izin-sakit/+page.svelte', 'izin-cuti/+page.svelte', 'izin-dinas/+page.svelte'].forEach(fileName => {
    const fPath = path.join(svelteDir, fileName);
    let c = fs.readFileSync(fPath, 'utf8');
    c = c.replace(
        '<label class="block text-xs font-medium text-muted-foreground mb-1">Pilih Karyawan</label>',
        '<label for="search-emp-select" class="block text-xs font-medium text-muted-foreground mb-1">Pilih Karyawan</label>'
    );
    c = c.replace(
        '<SearchableSelect\n                    bind:value={formEmployeeId}',
        '<SearchableSelect\n                    id="search-emp-select"\n                    bind:value={formEmployeeId}'
    );
    fs.writeFileSync(fPath, c, 'utf8');
});

console.log('Successfully eliminated all label warnings!');
