const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const ctrlPath = path.join(backendDir, 'app/Http/Controllers/Api/HrisTrainingController.php');
console.log(fs.readFileSync(ctrlPath, 'utf8'));
