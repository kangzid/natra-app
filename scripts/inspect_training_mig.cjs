const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const migrationsDir = path.join(backendDir, 'database/migrations');
const files = fs.readdirSync(migrationsDir).filter(f => f.includes('training'));
console.log('Training migrations:', files);
files.forEach(f => {
    console.log(`=== ${f} ===`);
    console.log(fs.readFileSync(path.join(migrationsDir, f), 'utf8'));
});
