const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack/src/routes/admin/hris/pengajuan';

function printLines(fileName, start, end) {
    const filePath = path.join(svelteDir, fileName);
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    console.log(`=== ${fileName} (Lines ${start}-${end}) ===`);
    console.log(lines.slice(start - 1, end).map((l, i) => `${start + i}: ${l}`).join('\n'));
}

printLines('izin-absen/+page.svelte', 365, 385);
printLines('izin-sakit/+page.svelte', 420, 440);
printLines('izin-cuti/+page.svelte', 370, 390);
