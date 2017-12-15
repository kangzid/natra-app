const fs = require('fs');

const layoutPath = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack/src/routes/admin/+layout.svelte';
const layoutCode = fs.readFileSync(layoutPath, 'utf8');

const idx = layoutCode.indexOf('Kehadiran & Operasional');
console.log(layoutCode.substring(idx - 50, idx + 500));
