const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';

function findFile(dir, name) {
    if (!fs.existsSync(dir)) return null;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
            const found = findFile(full, name);
            if (found) return found;
        } else if (e.name.toLowerCase() === name.toLowerCase()) {
            return full;
        }
    }
    return null;
}

const mapPickerFile = findFile(path.join(svelteDir, 'src'), 'map-picker.svelte');
console.log('MapPicker file path:', mapPickerFile);
if (mapPickerFile) {
    console.log(fs.readFileSync(mapPickerFile, 'utf8'));
}
