const fs = require('fs');

const assetsPage = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack/src/routes/admin/hris/assets/+page.svelte';
if (fs.existsSync(assetsPage)) {
  const content = fs.readFileSync(assetsPage, 'utf8');
  console.log(content.substring(content.indexOf('<div class="space-y-6">'), content.indexOf('<div class="space-y-6">') + 2500));
}
