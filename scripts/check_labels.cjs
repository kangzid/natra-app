const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack/src/routes/admin/hris/pengajuan';
const files = ['izin-absen/+page.svelte', 'izin-sakit/+page.svelte', 'izin-cuti/+page.svelte', 'izin-dinas/+page.svelte', 'pengaturan-cuti/+page.svelte'];

for (const f of files) {
    const filePath = path.join(svelteDir, f);
    const content = fs.readFileSync(filePath, 'utf8');
    const labelMatches = content.match(/<label\b[^>]*>/g) || [];
    let unassociated = 0;
    for (const l of labelMatches) {
        if (!l.includes('for=')) {
            unassociated++;
        }
    }
    console.log(`${f}: total labels=${labelMatches.length}, unassociated=${unassociated}`);
}
