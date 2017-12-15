const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const composerPath = path.join(backendDir, 'composer.json');
const composer = JSON.parse(fs.readFileSync(composerPath, 'utf8'));

console.log('Backend dependencies:');
console.log(composer.require);
