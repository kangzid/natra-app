const fs = require('fs');

const compliancePage = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack/src/routes/admin/hris/compliance/+page.svelte';
if (fs.existsSync(compliancePage)) {
  const content = fs.readFileSync(compliancePage, 'utf8');
  console.log(content.substring(0, 1500));
}
