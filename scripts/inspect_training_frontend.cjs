const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const trainingDir = path.join(svelteDir, 'src/routes/admin/hris/training');

if (fs.existsSync(trainingDir)) {
    const files = fs.readdirSync(trainingDir);
    console.log('Files in training dir:', files);
    files.forEach(f => {
        console.log(`=== ${f} ===`);
        console.log(fs.readFileSync(path.join(trainingDir, f), 'utf8'));
    });
} else {
    console.log('Training dir does NOT exist at', trainingDir);
}
