const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack';
const secureMedia = path.join(svelteDir, 'src/lib/utils/secureMedia.ts');

if (fs.existsSync(secureMedia)) {
    console.log('=== secureMedia.ts ===');
    console.log(fs.readFileSync(secureMedia, 'utf8'));
} else {
    console.log('secureMedia.ts not found. Searching in lib...');
}
