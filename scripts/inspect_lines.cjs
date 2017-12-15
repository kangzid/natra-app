const fs = require('fs');
const path = require('path');

const mobileDir = path.resolve('.');
const ctrlPath = path.join(mobileDir, 'src/features/tasks/task-detail.controller.js');
const lines = fs.readFileSync(ctrlPath, 'utf8').split('\n');
console.log(lines.slice(140, 180).join('\n'));
