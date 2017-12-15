const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');

console.log('=== HrisComplianceItem.php ===');
console.log(fs.readFileSync(path.join(backendDir, 'app/Models/HrisComplianceItem.php'), 'utf8'));

console.log('=== HrisViolation.php ===');
console.log(fs.readFileSync(path.join(backendDir, 'app/Models/HrisViolation.php'), 'utf8'));

console.log('=== HrisViolationType.php ===');
console.log(fs.readFileSync(path.join(backendDir, 'app/Models/HrisViolationType.php'), 'utf8'));
