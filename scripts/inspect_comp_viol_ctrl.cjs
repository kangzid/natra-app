const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const compCtrlPath = path.join(backendDir, 'app/Http/Controllers/Api/HrisComplianceController.php');
const violCtrlPath = path.join(backendDir, 'app/Http/Controllers/Api/HrisViolationController.php');

console.log('=== Checking HrisComplianceController.php ===');
if (fs.existsSync(compCtrlPath)) {
    console.log(fs.readFileSync(compCtrlPath, 'utf8').split('\n').slice(0, 150).join('\n'));
}

console.log('\n=== Checking HrisViolationController.php ===');
if (fs.existsSync(violCtrlPath)) {
    console.log(fs.readFileSync(violCtrlPath, 'utf8').split('\n').slice(0, 150).join('\n'));
}
