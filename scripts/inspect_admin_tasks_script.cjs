const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const adminTaskPage = path.join(svelteDir, 'src/routes/admin/tasks/+page.svelte');

const content = fs.readFileSync(adminTaskPage, 'utf8');
const lines = content.split('\n');

console.log('Total lines in admin tasks +page.svelte:', lines.length);

// Print script section and modal sections
console.log('=== Lines 1 to 150 ===');
console.log(lines.slice(0, 150).join('\n'));
