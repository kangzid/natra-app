const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack/src/routes/admin/hris/pengajuan';

function removeExtraDiv(fileName, searchPattern) {
    const filePath = path.join(svelteDir, fileName);
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(searchPattern, '        {/each}\n    </div>');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed extra closing div in ${fileName}!`);
}

// 1. Fix izin-absen
removeExtraDiv('izin-absen/+page.svelte', /        \{\/each\}\n    <\/div>\n<\/div>/);

// 2. Fix izin-sakit
removeExtraDiv('izin-sakit/+page.svelte', /        \{\/each\}\n    <\/div>\n<\/div>/);

// 3. Fix izin-cuti
removeExtraDiv('izin-cuti/+page.svelte', /        \{\/each\}\n    <\/div>\n<\/div>/);
