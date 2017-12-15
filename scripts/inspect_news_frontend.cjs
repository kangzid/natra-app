const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const newsDir = path.join(svelteDir, 'src/routes/admin/hris/news');

if (fs.existsSync(newsDir)) {
    const files = fs.readdirSync(newsDir);
    console.log('Files in news dir:', files);
    files.forEach(f => {
        console.log(`=== ${f} ===`);
        console.log(fs.readFileSync(path.join(newsDir, f), 'utf8'));
    });
} else {
    console.log('News dir does NOT exist');
}
