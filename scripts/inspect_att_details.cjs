const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');

console.log('=== HrisAttendanceSetting.php ===');
const settingModel = path.join(backendDir, 'app/Models/HrisAttendanceSetting.php');
if (fs.existsSync(settingModel)) {
  console.log(fs.readFileSync(settingModel, 'utf8'));
}

console.log('=== 2025_09_25_054748_create_attendances_table.php ===');
const attMig = path.join(backendDir, 'database/migrations/2025_09_25_054748_create_attendances_table.php');
if (fs.existsSync(attMig)) {
  console.log(fs.readFileSync(attMig, 'utf8'));
}

console.log('=== AttendanceController.php Snippet ===');
const attCtrl = path.join(backendDir, 'app/Http/Controllers/Api/AttendanceController.php');
if (fs.existsSync(attCtrl)) {
  const content = fs.readFileSync(attCtrl, 'utf8');
  console.log(content.substring(0, 3000));
}
