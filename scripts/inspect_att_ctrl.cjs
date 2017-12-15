const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const controllerPath = path.join(backendDir, 'app/Http/Controllers/Api/AttendanceController.php');
console.log('AttendanceController content:');
console.log(fs.readFileSync(controllerPath, 'utf8'));
