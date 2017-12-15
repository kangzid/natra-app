const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const apiRoutes = path.join(backendDir, 'routes/api.php');
const content = fs.readFileSync(apiRoutes, 'utf8');

console.log('=== Checking allowance routes in api.php ===');
content.split('\n').forEach((l, i) => {
    if (l.includes('allowance') || l.includes('Allowance')) {
        console.log(`L${i+1}: ${l}`);
    }
});
