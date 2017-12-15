const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const routesPath = path.join(backendDir, 'routes/api.php');
const content = fs.readFileSync(routesPath, 'utf8');

console.log(content);
