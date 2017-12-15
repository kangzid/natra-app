const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const violCtrlPath = path.join(backendDir, 'app/Http/Controllers/Api/HrisViolationController.php');
const content = fs.readFileSync(violCtrlPath, 'utf8');

console.log('=== HrisViolationController.php lines 130 to end ===');
console.log(content.split('\n').slice(130).join('\n'));
