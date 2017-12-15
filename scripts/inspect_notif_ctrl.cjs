const fs = require('fs');
const path = require('path');

const mobileDir = path.resolve('.');
const notifCtrl = path.join(mobileDir, 'src/features/notification/notification.controller.js');
console.log('=== notification.controller.js ===');
if (fs.existsSync(notifCtrl)) {
    console.log(fs.readFileSync(notifCtrl, 'utf8'));
} else {
    console.log('notification.controller.js not found');
}
