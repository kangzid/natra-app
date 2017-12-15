const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const encPath = path.join(backendDir, 'app/Services/EncryptedStorageService.php');
console.log(fs.readFileSync(encPath, 'utf8'));
