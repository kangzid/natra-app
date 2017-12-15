const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const empDetailSvelte = path.join(svelteDir, 'src/routes/admin/employees/[id]/+page.svelte');
const content = fs.readFileSync(empDetailSvelte, 'utf8');

const lines = content.split('\n');
lines.forEach((l, i) => {
    if (l.toLowerCase().includes('hanya') || l.toLowerCase().includes('read-only') || l.toLowerCase().includes('readonly')) {
        console.log(`Match at line ${i+1}: ${l}`);
    }
});
