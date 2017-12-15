const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const taskCtrl = path.join(backendDir, 'app/Http/Controllers/Api/TaskController.php');
console.log(fs.readFileSync(taskCtrl, 'utf8').split('\n').slice(0, 120).join('\n'));
