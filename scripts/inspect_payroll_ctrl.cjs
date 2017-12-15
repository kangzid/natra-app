const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const ctrlPath = path.join(backendDir, 'app/Http/Controllers/Api/HrisPayrollController.php');

if (fs.existsSync(ctrlPath)) {
    const content = fs.readFileSync(ctrlPath, 'utf8');
    console.log('=== HrisPayrollController lines 1 to 150 ===');
    console.log(content.split('\n').slice(0, 150).join('\n'));
} else {
    console.log('HrisPayrollController does not exist.');
}
