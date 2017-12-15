const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const compCtrlPath = path.join(backendDir, 'app/Http/Controllers/Api/HrisComplianceController.php');
const content = fs.readFileSync(compCtrlPath, 'utf8');

console.log('=== Entire HrisComplianceController.php ===');
console.log(content);
