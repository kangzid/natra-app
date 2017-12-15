const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';

function searchFiles(dir, pattern) {
  const results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    if (item.name === 'node_modules' || item.name === '.svelte-kit' || item.name === '.git') continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...searchFiles(full, pattern));
    } else if (item.name.endsWith('.svelte') || item.name.endsWith('.ts') || item.name.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes(pattern)) {
        results.push(full);
      }
    }
  }
  return results;
}

console.log('Files with /admin/attendances or HRIS nav:');
console.log(searchFiles(path.join(svelteDir, 'src'), 'Kehadiran & Operasional'));
console.log(searchFiles(path.join(svelteDir, 'src'), '/admin/attendances'));
