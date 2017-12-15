const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const modelPath = path.join(backendDir, 'app/Models/HrisTraining.php');
const ctrlPath = path.join(backendDir, 'app/Http/Controllers/Api/HrisTrainingController.php');

console.log('=== HrisTraining.php ===');
console.log(fs.readFileSync(modelPath, 'utf8'));

console.log('=== HrisTrainingController.php (first 100 lines) ===');
console.log(fs.readFileSync(ctrlPath, 'utf8').split('\n').slice(0, 100).join('\n'));
