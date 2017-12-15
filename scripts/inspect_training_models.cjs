const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const modelsDir = path.join(backendDir, 'app/Models');
const files = fs.readdirSync(modelsDir).filter(f => f.toLowerCase().includes('training'));
console.log('Training models:', files);
files.forEach(f => {
    console.log(`=== ${f} ===`);
    console.log(fs.readFileSync(path.join(modelsDir, f), 'utf8'));
});
