const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const pageFile = path.join(svelteDir, 'src/routes/admin/attendances/+page.svelte');
console.log(fs.readFileSync(pageFile, 'utf8'));
