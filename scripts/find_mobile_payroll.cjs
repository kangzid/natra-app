const fs = require('fs');
const path = require('path');

const mobileDir = 'e:/Semester-6/proyek-utama-informatika/code-projects/natra-mobile';

function findFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const full = path.join(dir, file);
        const stat = fs.statSync(full);
        if (stat && stat.isDirectory()) {
            if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
                results = results.concat(findFiles(full));
            }
        } else {
            results.push(path.relative(mobileDir, full));
        }
    });
    return results;
}

const allFiles = findFiles(mobileDir);
console.log('Mobile files related to payroll/gaji:');
allFiles.filter(f => f.includes('payroll') || f.includes('salary') || f.includes('slip') || f.includes('gaji') || f.includes('profile')).forEach(f => console.log(f));
