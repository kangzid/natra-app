const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const routesPath = path.join(backendDir, 'routes/api.php');
const content = fs.readFileSync(routesPath, 'utf8');

const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('attendance-settings') || line.includes('/shifts') || line.includes('AttendanceController')) {
    console.log(`Line ${index + 1}: ${line}`);
  }
});
