const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const mobileDir = path.resolve('.');

const storageService = path.join(backendDir, 'app/Services/EncryptedStorageService.php');
console.log('=== EncryptedStorageService.php ===');
console.log(fs.readFileSync(storageService, 'utf8'));

const newsCtrl = path.join(mobileDir, 'src/features/news/news.controller.js');
if (fs.existsSync(newsCtrl)) {
    console.log('=== news.controller.js ===');
    console.log(fs.readFileSync(newsCtrl, 'utf8'));
} else {
    console.log('news.controller.js does not exist');
}
