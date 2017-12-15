const fs = require('fs');
const path = require('path');

const mobileDir = path.resolve('.');
const notifHtml = path.join(mobileDir, 'pages/notifications.html');
const notifCtrl = path.join(mobileDir, 'src/features/notifications/notifications.controller.js');

console.log('=== notifications.html ===');
if (fs.existsSync(notifHtml)) {
    console.log(fs.readFileSync(notifHtml, 'utf8'));
}

console.log('=== notifications.controller.js ===');
if (fs.existsSync(notifCtrl)) {
    console.log(fs.readFileSync(notifCtrl, 'utf8'));
}
