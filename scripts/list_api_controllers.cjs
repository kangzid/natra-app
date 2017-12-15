const fs = require('fs');
const path = require('path');

const backendDir = path.resolve('../backup/tracker-loc-backend');
const apiControllers = path.join(backendDir, 'app/Http/Controllers/Api');

console.log('=== All API Controllers in backend ===');
if (fs.existsSync(apiControllers)) {
    console.log(fs.readdirSync(apiControllers));
}
