const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack/src/routes/admin/hris/pengajuan';

function findUnassociated(fileName) {
    const filePath = path.join(svelteDir, fileName);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((l, i) => {
        if (l.includes('<label') && !l.includes('for=')) {
            console.log(`${fileName} Line ${i+1}: ${l.trim()}`);
        }
    });
}

findUnassociated('pengaturan-cuti/+page.svelte');
findUnassociated('izin-absen/+page.svelte');
findUnassociated('izin-sakit/+page.svelte');
findUnassociated('izin-cuti/+page.svelte');
findUnassociated('izin-dinas/+page.svelte');
