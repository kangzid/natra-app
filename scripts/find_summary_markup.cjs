const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const svelteFile = path.join(svelteDir, 'src/routes/admin/hris/contracts/+page.svelte');
const content = fs.readFileSync(svelteFile, 'utf8');

const lines = content.split('\n');
console.log('=== Lines mentioning summary in markup ===');
lines.forEach((l, i) => {
    if (l.includes('summary.') || l.includes('Total Kontrak') || l.includes('PKWT') || l.includes('Tetap')) {
        console.log(`L${i+1}: ${l}`);
    }
});
