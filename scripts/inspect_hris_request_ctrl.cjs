const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const reqCtrl = path.join(backendDir, 'app/Http/Controllers/Api/HrisRequestController.php');

console.log('=== HrisRequestController.php ===');
if (fs.existsSync(reqCtrl)) {
    console.log(fs.readFileSync(reqCtrl, 'utf8'));
}
