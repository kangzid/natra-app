const fs = require('fs');

const assetsServer = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack/src/routes/admin/hris/assets/+page.server.ts';
if (fs.existsSync(assetsServer)) {
  console.log(fs.readFileSync(assetsServer, 'utf8'));
} else {
  console.log('assets/+page.server.ts does not exist');
}
