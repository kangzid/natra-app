const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const migrationsDir = path.join(backendDir, 'database/migrations');
const files = fs.readdirSync(migrationsDir).filter(f => f.includes('hris'));
console.log('Hris migrations:', files);
files.forEach(f => {
    const content = fs.readFileSync(path.join(migrationsDir, f), 'utf8');
    if (content.includes('trainings') || content.includes('training')) {
        console.log(`=== ${f} ===`);
        console.log(content);
    }
});
