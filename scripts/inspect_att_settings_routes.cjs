const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const routesPath = path.join(backendDir, 'routes/api.php');
const content = fs.readFileSync(routesPath, 'utf8');

const lines = content.split('\n');
console.log('=== All attendance-settings lines ===');
lines.forEach((l, i) => {
  if (l.includes('attendance-settings') || l.includes('AttendanceController')) {
    console.log(`${i+1}: ${l}`);
  }
});
