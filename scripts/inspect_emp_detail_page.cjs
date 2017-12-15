const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const empDetailSvelte = path.join(svelteDir, 'src/routes/admin/employees/[id]/+page.svelte');
const content = fs.readFileSync(empDetailSvelte, 'utf8');

// Look for header ("Mode Hanya Baca") and overview tab where loans are shown
console.log('=== Lines around "Hanya Baca" ===');
const lines = content.split('\n');
lines.slice(0, 150).forEach((l, i) => {
    if (l.includes('Hanya') || l.includes('Read-Only') || l.includes('Badge') || l.includes('Header')) {
        console.log(`L${i+1}: ${l}`);
    }
});

console.log('\n=== Lines around loans in Overview tab ===');
lines.slice(250, 400).forEach((l, i) => {
    if (l.includes('loans') || l.includes('Pinjaman') || l.includes('Cicilan')) {
        console.log(`L${i+251}: ${l}`);
    }
});
