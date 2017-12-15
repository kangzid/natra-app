const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const pageFile = path.join(svelteDir, 'src/routes/admin/attendances/+page.svelte');
const lines = fs.readFileSync(pageFile, 'utf8').split('\n');
console.log(lines.slice(360, 480).join('\n'));
