const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const taskCtrl = path.join(backendDir, 'app/Http/Controllers/Api/TaskController.php');
const lines = fs.readFileSync(taskCtrl, 'utf8').split('\n');
console.log(lines.slice(120, 220).join('\n'));
