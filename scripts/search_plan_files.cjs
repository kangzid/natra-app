const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const backendDir = path.resolve('../backup/tracker-loc-backend');

function findInDir(dir, pattern) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const f of files) {
        const full = path.join(dir, f.name);
        if (f.isDirectory() && !f.name.includes('node_modules') && !f.name.includes('.git') && !f.name.includes('.svelte-kit')) {
            results = results.concat(findInDir(full, pattern));
        } else if (f.isFile() && pattern.test(f.name)) {
            results.push(full);
        }
    }
    return results;
}

console.log('=== Searching Employee Detail files ===');
console.log(findInDir(path.join(svelteDir, 'src/routes/admin/employees'), /.*\.(svelte|ts)$/));

console.log('=== Searching Pengajuan files in frontend ===');
console.log(findInDir(path.join(svelteDir, 'src/routes/admin/hris/pengajuan'), /.*\.(svelte|ts)$/));

console.log('=== Searching Backend HRIS Leave & Loan Controllers ===');
console.log(findInDir(path.join(backendDir, 'app/Http/Controllers/Api'), /.*(Leave|Loan|Kasbon|Employee).*\.php$/));
