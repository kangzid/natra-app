const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const mobileDir = 'e:/Semester-6/proyek-utama-informatika/code-projects/natra-mobile';

console.log('=== 1. Checking HrisContractController.php ===');
const contractCtrl = path.join(backendDir, 'app/Http/Controllers/Api/HrisContractController.php');
if (fs.existsSync(contractCtrl)) {
    const content = fs.readFileSync(contractCtrl, 'utf8');
    console.log(content.split('\n').slice(0, 120).join('\n'));
}

console.log('=== 2. Checking contracts/+page.server.ts and +page.svelte ===');
const contractsServer = path.join(svelteDir, 'src/routes/admin/hris/contracts/+page.server.ts');
if (fs.existsSync(contractsServer)) {
    console.log(fs.readFileSync(contractsServer, 'utf8'));
}
