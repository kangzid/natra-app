const fs = require('fs');
const path = require('path');

const mobileDir = path.resolve('.');
const ctrlPath = path.join(mobileDir, 'src/features/tasks/task-detail.controller.js');
console.log(fs.readFileSync(ctrlPath, 'utf8'));
