const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const modelPath = path.join(backendDir, 'app/Models/HrisPayroll.php');
console.log(fs.readFileSync(modelPath, 'utf8'));
