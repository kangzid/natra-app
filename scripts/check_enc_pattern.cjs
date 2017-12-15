const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const newsCtrl = path.join(backendDir, 'app/Http/Controllers/Api/HrisNewsController.php');
const contractCtrl = path.join(backendDir, 'app/Http/Controllers/Api/HrisContractController.php');

console.log('=== Checking encryption in HrisContractController ===');
if (fs.existsSync(contractCtrl)) {
    const lines = fs.readFileSync(contractCtrl, 'utf8').split('\n');
    lines.forEach((l, i) => {
        if (l.includes('enc') || l.includes('crypt') || l.includes('Storage::')) {
            console.log(`Contract L${i+1}: ${l}`);
        }
    });
}
