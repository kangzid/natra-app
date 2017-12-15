const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const apiRoutes = path.join(backendDir, 'routes/api.php');
const content = fs.readFileSync(apiRoutes, 'utf8');

const lines = content.split('\n');
console.log('=== HRIS routes in api.php ===');
lines.forEach((l, i) => {
    if (l.includes('hris/') || l.includes('leave') || l.includes('HrisLeaveSettingController')) {
        console.log(`L${i+1}: ${l}`);
    }
});
