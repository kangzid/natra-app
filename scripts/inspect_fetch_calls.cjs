const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const compSvelte = path.join(svelteDir, 'src/routes/admin/hris/compliance/+page.svelte');
const violSvelte = path.join(svelteDir, 'src/routes/admin/hris/violations/+page.svelte');

console.log('=== Checking fetch calls in compliance/+page.svelte ===');
if (fs.existsSync(compSvelte)) {
    const lines = fs.readFileSync(compSvelte, 'utf8').split('\n');
    lines.forEach((l, i) => {
        if (l.includes('fetch(') || l.includes('PUBLIC_API_URL')) {
            console.log(`Compliance L${i+1}: ${l}`);
        }
    });
}

console.log('\n=== Checking fetch calls in violations/+page.svelte ===');
if (fs.existsSync(violSvelte)) {
    const lines = fs.readFileSync(violSvelte, 'utf8').split('\n');
    lines.forEach((l, i) => {
        if (l.includes('fetch(') || l.includes('PUBLIC_API_URL')) {
            console.log(`Violations L${i+1}: ${l}`);
        }
    });
}
