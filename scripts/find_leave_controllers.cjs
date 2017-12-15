const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');

function findInDir(dir, pattern) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const f of files) {
        const full = path.join(dir, f.name);
        if (f.isDirectory() && !f.name.includes('node_modules') && !f.name.includes('vendor')) {
            results = results.concat(findInDir(full, pattern));
        } else if (f.isFile() && pattern.test(f.name)) {
            results.push(full);
        }
    }
    return results;
}

console.log('=== Leave / Pengajuan controllers in backend ===');
console.log(findInDir(path.join(backendDir, 'app/Http/Controllers'), /.*(Leave|Pengajuan|Attendance|Permit|Izin).*\.php$/));
