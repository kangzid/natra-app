const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const ctrlPath = path.join(backendDir, 'app/Http/Controllers/Api/HrisPayrollController.php');
const content = fs.readFileSync(ctrlPath, 'utf8');
console.log('=== HrisPayrollController lines 145 to 225 ===');
console.log(content.split('\n').slice(144, 225).join('\n'));
