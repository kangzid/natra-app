const fs = require('fs');
const path = require('path');

const scriptsDir = path.resolve('./scripts');
if (fs.existsSync(scriptsDir)) {
    fs.readdirSync(scriptsDir).forEach(f => {
        if (f.startsWith('read_') || f.startsWith('check_') || f.startsWith('find_') || f.startsWith('inspect_') || f.startsWith('list_')) {
            fs.unlinkSync(path.join(scriptsDir, f));
        }
    });
}
console.log('Cleaned temporary scripts!');
