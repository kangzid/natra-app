const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const routesPath = path.join(backendDir, 'routes/api.php');
const content = fs.readFileSync(routesPath, 'utf8');

const lines = content.split('\n');
lines.forEach((l, idx) => {
    if (l.includes('HrisNewsController') || l.includes('news')) {
        console.log(`Line ${idx+1}: ${l}`);
    }
});
