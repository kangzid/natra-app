const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const contractCtrlPath = path.join(backendDir, 'app/Http/Controllers/Api/HrisContractController.php');
let contractCtrl = fs.readFileSync(contractCtrlPath, 'utf8');

console.log(contractCtrl.split('\n').slice(90, 140).join('\n'));
