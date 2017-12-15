const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const controllerPath = path.join(backendDir, 'app/Http/Controllers/Api/AttendanceController.php');
const lines = fs.readFileSync(controllerPath, 'utf8').split('\n');
console.log(lines.slice(30, 160).join('\n'));
