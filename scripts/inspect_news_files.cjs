const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const ctrlPath = path.join(backendDir, 'app/Http/Controllers/Api/HrisNewsController.php');
const modelPath = path.join(backendDir, 'app/Models/HrisNews.php');

console.log('=== HrisNewsController.php ===');
if (fs.existsSync(ctrlPath)) {
    console.log(fs.readFileSync(ctrlPath, 'utf8'));
} else {
    console.log('HrisNewsController.php does not exist');
}

console.log('=== HrisNews.php ===');
if (fs.existsSync(modelPath)) {
    console.log(fs.readFileSync(modelPath, 'utf8'));
} else {
    console.log('HrisNews.php does not exist');
}
