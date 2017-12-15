const fs = require('fs');
const path = require('path');

const mobileDir = path.resolve('.');
const profileHtml = path.join(mobileDir, 'pages/profile.html');
const profileCtrl = path.join(mobileDir, 'src/features/profile/profile.controller.js');

console.log('=== profile.html lines 200-300 ===');
const htmlLines = fs.readFileSync(profileHtml, 'utf8').split('\n');
console.log(htmlLines.slice(200, 300).join('\n'));

console.log('=== profile.controller.js lines around loan/kasbon and detail ===');
const ctrlLines = fs.readFileSync(profileCtrl, 'utf8').split('\n');
ctrlLines.forEach((l, i) => {
    if (l.includes('loan') || l.includes('kasbon') || l.includes('Cicilan') || l.includes('installment') || l.includes('modal')) {
        console.log(`L${i+1}: ${l}`);
    }
});
