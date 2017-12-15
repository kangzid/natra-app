const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const sakitPath = path.join(svelteDir, 'src/routes/admin/hris/pengajuan/izin-sakit/+page.svelte');
const lines = fs.readFileSync(sakitPath, 'utf8').split('\n');
console.log(lines.slice(160, 260).join('\n'));
