const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const serverFile = path.join(svelteDir, 'src/routes/admin/attendances/+page.server.ts');
const pageFile = path.join(svelteDir, 'src/routes/admin/attendances/+page.svelte');

if (fs.existsSync(serverFile)) {
    console.log('=== +page.server.ts ===');
    console.log(fs.readFileSync(serverFile, 'utf8'));
} else {
    console.log('+page.server.ts does NOT exist');
}

if (fs.existsSync(pageFile)) {
    console.log('=== +page.svelte (first 100 lines) ===');
    const lines = fs.readFileSync(pageFile, 'utf8').split('\n');
    console.log(lines.slice(0, 100).join('\n'));
}
