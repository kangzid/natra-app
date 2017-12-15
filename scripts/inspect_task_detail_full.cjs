const fs = require('fs');
const path = require('path');

const mobileDir = path.resolve('.');
const htmlPath = path.join(mobileDir, 'pages/task-detail.html');
const ctrlPath = path.join(mobileDir, 'src/features/tasks/task-detail.controller.js');

console.log('=== pages/task-detail.html ===');
console.log(fs.readFileSync(htmlPath, 'utf8'));

console.log('=== src/features/tasks/task-detail.controller.js ===');
console.log(fs.readFileSync(ctrlPath, 'utf8'));
