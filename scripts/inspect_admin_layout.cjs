const fs = require('fs');
const layoutPath = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack/src/routes/admin/+layout.svelte';
const content = fs.readFileSync(layoutPath, 'utf8');

console.log(content.substring(content.indexOf('hris') - 200, content.indexOf('hris') + 2000));
