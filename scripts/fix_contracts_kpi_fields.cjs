const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const contractsSveltePath = path.join(svelteDir, 'src/routes/admin/hris/contracts/+page.svelte');
let content = fs.readFileSync(contractsSveltePath, 'utf8');

// Update summary property references in KPI cards
content = content.replace('{summary.pkwt_contracts || 0}', '{summary.pkwt_count || summary.pkwt_contracts || 0}');
content = content.replace('{summary.pkwtt_contracts || 0}', '{summary.pkwtt_count || summary.pkwtt_contracts || 0}');

fs.writeFileSync(contractsSveltePath, content, 'utf8');
console.log('Updated contracts/+page.svelte KPI card summary field names!');
