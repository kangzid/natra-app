const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack/src/routes/admin/hris/pengajuan';

function inspectBottom(fileName) {
    const filePath = path.join(svelteDir, fileName);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    console.log(`=== ${fileName} (Last 25 lines) ===`);
    console.log(lines.slice(-25).map((l, i) => `${lines.length - 25 + i + 1}: ${l}`).join('\n'));
}

inspectBottom('izin-absen/+page.svelte');
inspectBottom('izin-sakit/+page.svelte');
inspectBottom('izin-cuti/+page.svelte');
inspectBottom('izin-dinas/+page.svelte');
