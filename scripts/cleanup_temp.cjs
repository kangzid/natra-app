const fs = require('fs');
const path = require('path');

const scriptsDir = path.resolve('./scripts');
if (fs.existsSync(scriptsDir)) {
    fs.readdirSync(scriptsDir).forEach(f => {
        if (f.startsWith('read_') || f.startsWith('search_') || f.startsWith('fetch_') || f.startsWith('wmic_') || f.startsWith('update_')) {
            fs.unlinkSync(path.join(scriptsDir, f));
        }
    });
}
console.log('Cleaned temporary scripts!');
