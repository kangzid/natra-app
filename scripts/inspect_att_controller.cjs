const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const attCtrl = path.join(backendDir, 'app/Http/Controllers/Api/AttendanceController.php');
const content = fs.readFileSync(attCtrl, 'utf8');

console.log(content.substring(2500, 8500));
