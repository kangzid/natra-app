const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const attCtrlPath = path.join(backendDir, 'app/Http/Controllers/Api/AttendanceController.php');
let content = fs.readFileSync(attCtrlPath, 'utf8');

console.log('Inspecting todayAttendance in AttendanceController.php:');
const startIdx = content.indexOf('public function todayAttendance');
console.log(content.substring(startIdx, startIdx + 1500));
