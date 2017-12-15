const fs = require('fs');
const path = require('path');

const svelteDir = 'E:/Semester-5/pengembangan-aplikasi-mobile/frontend-locatrack/src/routes/admin/hris/pengajuan';

function fixFile(fileName) {
    const filePath = path.join(svelteDir, fileName);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    console.log(`\n=== Analyzing ${fileName} ===`);
    let depth = 0;
    let inScript = true;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('</script>')) {
            inScript = false;
            continue;
        }
        if (inScript) continue;
        
        // Count open div vs close div on this line
        const opens = (line.match(/<div(\s|>)/g) || []).length;
        const closes = (line.match(/<\/div>/g) || []).length;
        
        depth += opens - closes;
        
        if (depth < 0) {
            console.log(`Extra closing div detected at line ${i+1}: "${line.trim()}" (depth=${depth})`);
        }
    }
    console.log(`Final depth for ${fileName}: ${depth}`);
}

fixFile('izin-absen/+page.svelte');
fixFile('izin-sakit/+page.svelte');
fixFile('izin-cuti/+page.svelte');
fixFile('izin-dinas/+page.svelte');
