const fs = require('fs');
const path = require('path');

const scriptsDir = path.resolve('./scripts');
if (fs.existsSync(scriptsDir)) {
    fs.readdirSync(scriptsDir).forEach(f => {
        if (f.startsWith('inspect_') || f.startsWith('update_') || f.startsWith('find_') || f.startsWith('clean_') || f.startsWith('restore_') || f.startsWith('add_') || f.startsWith('make_') || f.startsWith('rewrite_')) {
            fs.unlinkSync(path.join(scriptsDir, f));
        }
    });
    console.log('Cleaned up temporary scripts!');
}
