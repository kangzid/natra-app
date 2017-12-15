const fs = require('fs');
const path = require('path');

const mobileDir = path.resolve('.');
const profileCtrl = path.join(mobileDir, 'src/features/profile/profile.controller.js');
const lines = fs.readFileSync(profileCtrl, 'utf8').split('\n');
console.log(lines.slice(190, 420).join('\n'));
